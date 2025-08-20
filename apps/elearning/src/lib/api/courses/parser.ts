import { type SelectData } from '@/lib/api'
import { parseUser } from '@/lib/api/users/parser'
import { createParser } from '@/lib/api/utils'
import { LOCALE_ITEMS } from '@/lib/i18n/config'

import { type courseQuery, type lessonQuery } from './queries'
import { CourseStatus, LessonType, type Course, type Lesson } from './types'

const parseCourseStatus = ({
  archivedAt,
  publishedLocales,
}: SelectData<'courses', typeof courseQuery>): CourseStatus => {
  if (archivedAt) return CourseStatus.Archived
  if (!publishedLocales || publishedLocales.length === 0) return CourseStatus.Draft
  if (publishedLocales.length < LOCALE_ITEMS.length) return CourseStatus.Partial
  return CourseStatus.Published
}

export const parseCourse = createParser<'courses', typeof courseQuery, Course>(course => {
  const { creator: courseCreator, lessons: courseLessons, user_courses, ...rest } = course
  const status = parseCourseStatus(course)
  const lessons = courseLessons.map(parseLesson)
  const enrolled = user_courses.length > 0
  const completion = Math.round((lessons.filter(lesson => lesson.completed).length / lessons.length) * 100) || 0
  const completed = completion === 100
  const progress = completion === 0 ? 'not_started' : completed ? 'completed' : 'in_progress'
  const creator = parseUser(courseCreator)
  const contributions = [
    {
      id: 0,
      user: creator,
      createdAt: course.createdAt,
      updatedAt: course.createdAt,
    },
    ...lessons.flatMap(lesson => lesson.contributions),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const contributors = [...new Set(contributions.map(contribution => contribution.user))].map(user => ({
    ...user,
    count: contributions.filter(contribution => contribution.user.id === user.id).length,
  }))

  return {
    ...rest,
    status,
    lessons,
    enrolled,
    completion,
    progress,
    completed,
    creator,
    contributions,
    contributors,
  } as Course
})

export const parseLesson = createParser<'lessons', typeof lessonQuery, Lesson>(({ user_lessons, ...lesson }) => {
  const questions = lesson.questions.map(({ options, ...question }) => ({
    ...question,
    options: options.map(({ user_answers, ...option }) => ({
      ...option,
      isUserAnswer: user_answers.length > 0,
    })),
    answered: options.some(option => option.user_answers.length > 0),
  }))
  const assessment = lesson.assessment
    ? {
        ...lesson.assessment,
        userRating: lesson.assessment.user_assessments[0]?.value,
      }
    : undefined
  const evaluations = lesson.evaluations.map(({ user_evaluations, ...evaluation }) => ({
    ...evaluation,
    userRating: user_evaluations[0]?.value,
  }))
  const contributions = lesson.contributions.map(contribution => ({
    ...contribution,
    user: parseUser(contribution.user),
  }))

  let type: LessonType = LessonType.Reading
  if (questions.length) type = LessonType.Questions
  if (evaluations.length) type = LessonType.Evaluations
  if (assessment) type = LessonType.Assessment

  const completed = user_lessons.length > 0

  return {
    ...lesson,
    type,
    questions,
    assessment,
    evaluations,
    completed,
    contributions,
  } as Lesson
})
