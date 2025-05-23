import type { IntlRecord } from '@/services/i18n'

import type { selectModule } from './queries'
import {
  ModuleStatus,
  type Module,
  type ModuleQuestion,
  type ModuleSkillEvaluation,
  type ModuleStep,
  type ModuleSubskillEvaluation,
  type Skill,
} from './types'

type ModuleRecord = NonNullable<Awaited<ReturnType<typeof selectModule>>['data']>[0]

export const parseModule = ({ description, module_steps, skills, title, user_modules, ...module }: ModuleRecord): Module => {
  const intlTitle = title as IntlRecord
  const intlDescription = description as IntlRecord
  const skill = skills as Skill

  const steps = module_steps
    .map(
      ({ module_questions, module_skill_evaluations, module_subskill_evaluations, user_module_steps, ...step }): ModuleStep => {
        const questions = module_questions.map(({ user_answers, ...question }) => ({
          ...question,
          user_answer: user_answers?.at(0)?.value,
        })) as ModuleQuestion[]
        const subskill_evaluations = module_subskill_evaluations.map(
          ({ subskill_id, user_subskill_evaluations, ...subskill_evaluation }) => {
            const subskill = skill.subskills.find(({ id }) => id === subskill_id)
            return {
              ...subskill_evaluation,
              subskill,
              user_evaluation: user_subskill_evaluations?.at(0)?.value,
            }
          },
        ) as ModuleSubskillEvaluation[]
        const skill_evaluation = module_skill_evaluations.length
          ? module_skill_evaluations
              .map(({ description, user_skill_evaluations, ...evaluation }): ModuleSkillEvaluation => {
                const user_evaluation = user_skill_evaluations?.at(0)?.value
                return { ...evaluation, description: description as IntlRecord, user_evaluation, skill }
              })
              .at(0)
          : undefined

        const userStep = !!user_module_steps.find(userModule => userModule.module_step_id === step.id)
        let completed = false

        if (userStep) {
          switch (step.type) {
            case 'descriptive':
              completed = true
              break
            case 'questions':
              completed = questions.every(question => !!question.user_answer)
              break
            case 'subskill_evaluations':
              completed = subskill_evaluations.every(evaluation => !!evaluation.user_evaluation)
              break
            case 'skill_evaluation':
              completed = !!skill_evaluation?.user_evaluation
              break
          }
        }

        return {
          ...step,
          title: step.title as IntlRecord,
          description: step.description as IntlRecord,
          content: step.content as IntlRecord,
          questions,
          subskill_evaluations,
          skill_evaluation,
          completed,
        }
      },
    )
    .sort((a, b) => a.sort_order - b.sort_order)

  const type = skill ? 'introduction' : 'module'
  const steps_count = steps.length
  const completed_steps_count = steps.filter(({ completed }) => completed).length
  const progress = steps_count > 0 && completed_steps_count > 0 ? Math.round((completed_steps_count / steps_count) * 100) : 0
  const status = progress === 100 ? ModuleStatus.Completed : progress > 0 ? ModuleStatus.InProgress : ModuleStatus.NotStarted

  return {
    ...module,
    title: intlTitle,
    description: intlDescription,
    type,
    skill,
    steps,
    steps_count,
    completed_steps_count,
    progress,
    status,
  }
}
