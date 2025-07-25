'use client'

import { useEffect, useMemo, useState } from 'react'

import { formatCodeBlock, isLangSupported } from '@platejs/code-block'
import { BracesIcon, Check, CheckIcon, CopyIcon } from 'lucide-react'
import { NodeApi, type TCodeBlockElement, type TCodeSyntaxLeaf } from 'platejs'
import {
  PlateElement,
  PlateLeaf,
  useEditorRef,
  useElement,
  useReadOnly,
  type PlateElementProps,
  type PlateLeafProps,
} from 'platejs/react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'

export const CodeBlockElement = (props: PlateElementProps<TCodeBlockElement>) => {
  const { editor, element } = props
  const t = useTranslations('Editor')

  return (
    <PlateElement
      className={`
        py-1
        **:[.hljs-addition]:bg-[#f0fff4] **:[.hljs-addition]:text-[#22863a]
        dark:**:[.hljs-addition]:bg-[#3c5743] dark:**:[.hljs-addition]:text-[#ceead5]
        **:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#005cc5]
        dark:**:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#6596cf]
        **:[.hljs-built\\\\_in,.hljs-symbol]:text-[#e36209]
        dark:**:[.hljs-built\\\\_in,.hljs-symbol]:text-[#c3854e]
        **:[.hljs-bullet]:text-[#735c0f] **:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d]
        dark:**:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d]
        **:[.hljs-deletion]:bg-[#ffeef0] **:[.hljs-deletion]:text-[#b31d28]
        dark:**:[.hljs-deletion]:bg-[#473235] dark:**:[.hljs-deletion]:text-[#e7c7cb]
        **:[.hljs-emphasis]:italic
        **:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language\\\\_]:text-[#d73a49]
        dark:**:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language\\\\_]:text-[#ee6960]
        **:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#22863a]
        dark:**:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#36a84f]
        **:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#032f62]
        dark:**:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#3593ff]
        **:[.hljs-section]:font-bold **:[.hljs-section]:text-[#005cc5]
        dark:**:[.hljs-section]:text-[#61a5f2]
        **:[.hljs-strong]:font-bold **:[.hljs-title,.hljs-title.class\\\\_,.hljs-title.class\\\\_.inherited\\\\_\\\\_,.hljs-title.function\\\\_]:text-[#6f42c1]
        dark:**:[.hljs-title,.hljs-title.class\\\\_,.hljs-title.class\\\\_.inherited\\\\_\\\\_,.hljs-title.function\\\\_]:text-[#a77bfa]
      `}
      {...props}
    >
      <div className="relative rounded-md bg-muted/50">
        <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
          <code>{props.children}</code>
        </pre>

        <div className="absolute top-1 right-1 z-10 flex gap-0.5 select-none" contentEditable={false}>
          {isLangSupported(element.lang) && (
            <Button
              className="size-6 text-xs"
              onClick={() => formatCodeBlock(editor, { element })}
              size="icon"
              title={t('actions.formatCode')}
              variant="ghost"
            >
              <BracesIcon className="!size-3.5 text-muted-foreground" />
            </Button>
          )}

          <CodeBlockCombobox />

          <CopyButton
            className="size-6 gap-1 text-xs text-muted-foreground"
            size="icon"
            value={() => NodeApi.string(element)}
            variant="ghost"
          />
        </div>
      </div>
    </PlateElement>
  )
}

const CodeBlockCombobox = () => {
  const [open, setOpen] = useState(false)
  const readOnly = useReadOnly()
  const editor = useEditorRef()
  const element = useElement<TCodeBlockElement>()
  const t = useTranslations('Editor')

  const value = useMemo(() => element.lang || 'plaintext', [element.lang])
  const [searchValue, setSearchValue] = useState('')

  const items = useMemo(
    () =>
      languages.filter(language => !searchValue || language.label.toLowerCase().includes(searchValue.toLowerCase())),
    [searchValue],
  )

  if (readOnly) return null

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none"
          role="combobox"
          size="sm"
          variant="ghost"
        >
          {languages.find(language => language.value === value)?.label ?? 'Plain Text'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" onCloseAutoFocus={() => setSearchValue('')}>
        <Command shouldFilter={false}>
          <CommandInput
            className="h-9"
            onValueChange={value => setSearchValue(value)}
            placeholder={t('placeholders.searchLanguage')}
            value={searchValue}
          />
          <CommandEmpty>{t('messages.noLanguageFound')}</CommandEmpty>
          <CommandList className="h-[344px] overflow-y-auto">
            <CommandGroup>
              {items.map(language => (
                <CommandItem
                  className="cursor-pointer"
                  key={language.label}
                  onSelect={value => {
                    editor.tf.setNodes<TCodeBlockElement>({ lang: value }, { at: element })
                    setSearchValue(value)
                    setOpen(false)
                  }}
                  value={language.value}
                >
                  <Check className={cn(value === language.value ? 'opacity-100' : 'opacity-0')} />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const CopyButton = ({
  value,
  ...props
}: { value: (() => string) | string } & Omit<React.ComponentProps<typeof Button>, 'value'>) => {
  const t = useTranslations('Editor')

  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [hasCopied])

  return (
    <Button
      onClick={() => {
        void navigator.clipboard.writeText(typeof value === 'function' ? value() : value)
        setHasCopied(true)
      }}
      {...props}
    >
      <span className="sr-only">{t('actions.copy')}</span>
      {hasCopied ? <CheckIcon className="!size-3" /> : <CopyIcon className="!size-3" />}
    </Button>
  )
}

export const CodeLineElement = (props: PlateElementProps) => <PlateElement {...props} />

export const CodeSyntaxLeaf = (props: PlateLeafProps<TCodeSyntaxLeaf>) => {
  const tokenClassName = props.leaf.className as string
  return <PlateLeaf className={tokenClassName} {...props} />
}

const languages: Array<{ label: string; value: string }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'ABAP', value: 'abap' },
  { label: 'Agda', value: 'agda' },
  { label: 'Arduino', value: 'arduino' },
  { label: 'ASCII Art', value: 'ascii' },
  { label: 'Assembly', value: 'x86asm' },
  { label: 'Bash', value: 'bash' },
  { label: 'BASIC', value: 'basic' },
  { label: 'BNF', value: 'bnf' },
  { label: 'C', value: 'c' },
  { label: 'C#', value: 'csharp' },
  { label: 'C++', value: 'cpp' },
  { label: 'Clojure', value: 'clojure' },
  { label: 'CoffeeScript', value: 'coffeescript' },
  { label: 'Coq', value: 'coq' },
  { label: 'CSS', value: 'css' },
  { label: 'Dart', value: 'dart' },
  { label: 'Dhall', value: 'dhall' },
  { label: 'Diff', value: 'diff' },
  { label: 'Docker', value: 'dockerfile' },
  { label: 'EBNF', value: 'ebnf' },
  { label: 'Elixir', value: 'elixir' },
  { label: 'Elm', value: 'elm' },
  { label: 'Erlang', value: 'erlang' },
  { label: 'F#', value: 'fsharp' },
  { label: 'Flow', value: 'flow' },
  { label: 'Fortran', value: 'fortran' },
  { label: 'Gherkin', value: 'gherkin' },
  { label: 'GLSL', value: 'glsl' },
  { label: 'Go', value: 'go' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Haskell', value: 'haskell' },
  { label: 'HCL', value: 'hcl' },
  { label: 'HTML', value: 'html' },
  { label: 'Idris', value: 'idris' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'Julia', value: 'julia' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'LaTeX', value: 'latex' },
  { label: 'Less', value: 'less' },
  { label: 'Lisp', value: 'lisp' },
  { label: 'LiveScript', value: 'livescript' },
  { label: 'LLVM IR', value: 'llvm' },
  { label: 'Lua', value: 'lua' },
  { label: 'Makefile', value: 'makefile' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Markup', value: 'markup' },
  { label: 'MATLAB', value: 'matlab' },
  { label: 'Mathematica', value: 'mathematica' },
  { label: 'Mermaid', value: 'mermaid' },
  { label: 'Nix', value: 'nix' },
  { label: 'Notion Formula', value: 'notion' },
  { label: 'Objective-C', value: 'objectivec' },
  { label: 'OCaml', value: 'ocaml' },
  { label: 'Pascal', value: 'pascal' },
  { label: 'Perl', value: 'perl' },
  { label: 'PHP', value: 'php' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Prolog', value: 'prolog' },
  { label: 'Protocol Buffers', value: 'protobuf' },
  { label: 'PureScript', value: 'purescript' },
  { label: 'Python', value: 'python' },
  { label: 'R', value: 'r' },
  { label: 'Racket', value: 'racket' },
  { label: 'Reason', value: 'reasonml' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'Sass', value: 'scss' },
  { label: 'Scala', value: 'scala' },
  { label: 'Scheme', value: 'scheme' },
  { label: 'SCSS', value: 'scss' },
  { label: 'Shell', value: 'shell' },
  { label: 'Smalltalk', value: 'smalltalk' },
  { label: 'Solidity', value: 'solidity' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TOML', value: 'toml' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'VB.Net', value: 'vbnet' },
  { label: 'Verilog', value: 'verilog' },
  { label: 'VHDL', value: 'vhdl' },
  { label: 'Visual Basic', value: 'vbnet' },
  { label: 'WebAssembly', value: 'wasm' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
]
