import { BaseTableCellHeaderPlugin, BaseTableCellPlugin, BaseTablePlugin, BaseTableRowPlugin } from '@platejs/table'

import {
  TableCellElementStatic,
  TableCellHeaderElementStatic,
  TableElementStatic,
  TableRowElementStatic,
} from '#rte/blocks/table-node-static'

export const BaseTableKit = [
  BaseTablePlugin.withComponent(TableElementStatic),
  BaseTableRowPlugin.withComponent(TableRowElementStatic),
  BaseTableCellPlugin.withComponent(TableCellElementStatic),
  BaseTableCellHeaderPlugin.withComponent(TableCellHeaderElementStatic),
]
