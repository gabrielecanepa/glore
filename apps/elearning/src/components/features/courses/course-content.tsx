'use client'

import { useCallback, useMemo } from 'react'

import { log } from '@repo/utils/logger'

import { CourseAssessment } from '@/components/features/courses/course-assessment'
import { CourseEvaluations } from '@/components/features/courses/course-evaluations'
import { CourseQuestions } from '@/components/features/courses/course-questions'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useApi } from '@/hooks/use-api'
import { useCourse } from '@/hooks/use-course'
import { useLocale } from '@/hooks/use-locale'
import { useSyncState } from '@/hooks/use-sync-state'
import { type Lesson, type Question, type QuestionOption } from '@/lib/api/courses/types'
import { cn } from '@/lib/utils'

export const CourseContent = ({ lesson, preview }: { lesson: Lesson; preview: boolean }) => {
  const api = useApi()
  const { language, setCourse, step } = useCourse()
  const { localize } = useLocale()
  const { setSyncState } = useSyncState()

  const onQuestionAnswer = useCallback(
    async (question: Question, option: QuestionOption) => {
      setCourse(({ lessons, ...course }) => ({
        ...course,
        lessons: lessons?.map((lesson, i) =>
          i === step
            ? {
                ...lesson,
                questions: lesson.questions?.map(q =>
                  q.id === question.id
                    ? {
                        ...q,
                        answered: true,
                        options: q.options.map(o => ({ ...o, isUserAnswer: o.id === option.id })),
                      }
                    : q,
                ),
              }
            : lesson,
        ),
      }))
      try {
        setSyncState('syncing')
        await api.courses.submitAnswers([{ id: question.id }])
        setSyncState('complete')
      } catch (e) {
        setSyncState('error')
        log.error(e)
      }
    },
    [api.courses, step, setCourse, setSyncState],
  )

  const onEvaluation = useCallback(
    (id: number, rating: number) => {
      setCourse(({ lessons, ...course }) => ({
        ...course,
        lessons: lessons?.map(({ evaluations, ...lesson }, i) =>
          i === step
            ? {
                ...lesson,
                evaluations: evaluations?.map(e => (e.id === id ? { ...e, userRating: rating } : e)),
              }
            : lesson,
        ),
      }))
    },
    [step, setCourse],
  )

  const onAssessment = useCallback(
    (rating: number) => {
      setCourse(({ lessons, ...course }) => ({
        ...course,
        lessons: lessons?.map((lesson, i) =>
          i === step && lesson.assessment
            ? { ...lesson, assessment: { ...lesson.assessment, userRating: rating } }
            : lesson,
        ),
      }))
    },
    [step, setCourse],
  )

  const blockStyles = useMemo(() => cn('pt-4', preview && 'mt-8 border-t-2 pt-6'), [preview])

  return (
    <div>
      <RichTextEditor autoFocus defaultValue={localize(lesson.content, language)} variant="fullWidth" />
      {lesson.type === 'questions' && lesson.questions && (
        <CourseQuestions
          className={blockStyles}
          completed={lesson.completed}
          onComplete={onQuestionAnswer}
          questions={lesson.questions}
        />
      )}
      {lesson.type === 'evaluations' && lesson.evaluations && (
        <CourseEvaluations
          className={blockStyles}
          completed={lesson.completed}
          evaluations={lesson.evaluations}
          onEvaluation={onEvaluation}
        />
      )}
      {lesson.type === 'assessment' && lesson.assessment && (
        <CourseAssessment
          assessment={lesson.assessment}
          className={blockStyles}
          completed={lesson.completed}
          onValueChange={onAssessment}
        />
      )}
    </div>
  )
}
