import { ChevronRight } from 'lucide-react'
import { SlateElement, type SlateElementProps } from 'platejs'

export const ToggleElementStatic = (props: SlateElementProps) => (
  <SlateElement {...props} className="pl-6">
    <div
      className={`
        absolute top-0 -left-0.5 size-6 cursor-pointer items-center justify-center rounded-md p-px text-muted-foreground transition-colors select-none
        hover:bg-accent
        [&_svg]:size-4
      `}
      contentEditable={false}
    >
      <ChevronRight className="rotate-0 transition-transform duration-75" />
    </div>
    {props.children}
  </SlateElement>
)
