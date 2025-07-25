'use client'

import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react'

import { EquationElement, InlineEquationElement } from '#rte/blocks/equation-node'

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
]
