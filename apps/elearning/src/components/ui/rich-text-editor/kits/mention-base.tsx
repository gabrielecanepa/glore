import { BaseMentionPlugin } from '@platejs/mention'

import { MentionElementStatic } from '#rte/blocks/mention-node-static'

export const BaseMentionKit = [BaseMentionPlugin.withComponent(MentionElementStatic)]
