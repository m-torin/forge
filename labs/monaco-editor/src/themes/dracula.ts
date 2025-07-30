// draculaTheme.js
import type * as monacoType from 'monaco-editor';

const withAlphaRGBA = (hex: string, alphaPercent: number) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const a = alphaPercent / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const draculaColors = {
  // Base Colors
  background: '#282A36',
  foreground: '#F8F8F2',
  selection: '#44475A',
  comment: '#6272A4',
  cyan: '#8BE9FD',
  green: '#50FA7B',
  orange: '#FFB86C',
  pink: '#FF79C6',
  purple: '#BD93F9',
  red: '#FF5555',
  yellow: '#F1FA8C',

  // ANSI Colors
  ansiBlack: '#21222C',
  ansiRed: '#FF5555',
  ansiGreen: '#50FA7B',
  ansiYellow: '#F1FA8C',
  ansiBlue: '#BD93F9',
  ansiMagenta: '#FF79C6',
  ansiCyan: '#8BE9FD',
  ansiWhite: '#F8F8F2',
  ansiBrightBlack: '#6272A4',
  ansiBrightRed: '#FF6E6E',
  ansiBrightGreen: '#69FF94',
  ansiBrightYellow: '#FFFFA5',
  ansiBrightBlue: '#D6ACFF',
  ansiBrightMagenta: '#FF92DF',
  ansiBrightCyan: '#A4FFFF',
  ansiBrightWhite: '#FFFFFF',

  // Other Colors
  lineHighlight: '#44475A75',
  nonText: '#FFFFFF1A',
  white: '#FFFFFF',
  tabDropBg: '#44475A70',
  bgLighter: '#424450',
  bgLight: '#343746',
  bgDark: '#21222C',
  bgDarker: '#191A21',
  tempQuotes: '#E9F284',
  tempPropertyQuotes: '#8BE9FE',
};

export const draculaTheme: monacoType.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Base Rule
    {
      token: '',
      foreground: draculaColors.foreground,
      background: draculaColors.background,
    },

    // General
    { token: 'invalid', foreground: draculaColors.red },
    { token: 'emphasis', fontStyle: 'italic' },
    { token: 'strong', fontStyle: 'bold' },
    { token: 'header', foreground: draculaColors.purple },

    // Comments
    { token: 'comment', foreground: draculaColors.comment },
    {
      token: 'punctuation.definition.comment',
      foreground: draculaColors.comment,
    },
    { token: 'unused.comment', foreground: draculaColors.comment },
    { token: 'wildcard.comment', foreground: draculaColors.comment },
    {
      token: 'comment.keyword.codetag.notation',
      foreground: draculaColors.pink,
    },
    {
      token: 'comment.block.documentation.keyword',
      foreground: draculaColors.pink,
    },
    {
      token: 'comment.block.documentation.storage.type.class',
      foreground: draculaColors.pink,
    },
    {
      token: 'comment.block.documentation.entity.name.type',
      foreground: draculaColors.cyan,
      fontStyle: 'italic',
    },
    {
      token:
        'comment.block.documentation.entity.name.type punctuation.definition.bracket',
      foreground: draculaColors.cyan,
    },
    {
      token: 'comment.block.documentation.variable',
      foreground: draculaColors.orange,
      fontStyle: 'italic',
    },

    // Constants
    { token: 'constant', foreground: draculaColors.purple },
    { token: 'variable.other.constant', foreground: draculaColors.purple },
    { token: 'constant.character.escape', foreground: draculaColors.pink },
    {
      token: 'constant.character.string.escape',
      foreground: draculaColors.pink,
    },
    { token: 'constant.regexp', foreground: draculaColors.yellow },

    // Entities
    { token: 'entity.name.tag', foreground: draculaColors.pink },
    {
      token: 'entity.other.attribute-name.parent-selector',
      foreground: draculaColors.pink,
    },
    {
      token: 'entity.other.attribute-name',
      foreground: draculaColors.green,
      fontStyle: 'italic',
    },

    // Functions/Methods
    { token: 'entity.name.function', foreground: draculaColors.green },
    { token: 'meta.function-call.object', foreground: draculaColors.green },
    { token: 'meta.function-call.php', foreground: draculaColors.green },
    { token: 'meta.function-call.static', foreground: draculaColors.green },
    { token: 'meta.method-call.java', foreground: draculaColors.green },
    { token: 'meta.method.groovy', foreground: draculaColors.green },
    {
      token: 'support.function.any-method.lua',
      foreground: draculaColors.green,
    },
    {
      token: 'keyword.operator.function.infix',
      foreground: draculaColors.green,
    },

    // Function Parameters
    {
      token: 'entity.name.variable.parameter',
      foreground: draculaColors.orange,
      fontStyle: 'italic',
    },
    {
      token: 'variable.parameter.function.language.special',
      foreground: draculaColors.orange,
      fontStyle: 'italic',
    },
    {
      token: 'variable.parameter',
      foreground: draculaColors.orange,
      fontStyle: 'italic',
    },

    // Decorators
    {
      token: 'meta.decorator variable.other.readwrite',
      foreground: draculaColors.green,
      fontStyle: 'italic',
    },
    {
      token: 'meta.decorator variable.other.property',
      foreground: draculaColors.green,
      fontStyle: 'italic',
    },
    {
      token: 'meta.decorator variable.other.object',
      foreground: draculaColors.green,
    },

    // Keywords
    { token: 'keyword', foreground: draculaColors.pink },
    { token: 'punctuation.definition.keyword', foreground: draculaColors.pink },
    { token: 'keyword.flow', foreground: draculaColors.pink },
    { token: 'keyword.json', foreground: draculaColors.pink },
    { token: 'keyword.flow.scss', foreground: draculaColors.pink },
    { token: 'keyword.control.new', fontStyle: 'bold' },
    { token: 'keyword.operator.new', fontStyle: 'bold' },

    // Punctuation
    { token: 'delimiter.html', foreground: draculaColors.pink },
    { token: 'delimiter.xml', foreground: draculaColors.pink },
    { token: 'delimiter', foreground: draculaColors.pink },
    {
      token: 'punctuation.definition.group.capture.regexp',
      foreground: draculaColors.pink,
    },
    {
      token: 'punctuation.definition.group.assertion.regexp',
      foreground: draculaColors.red,
    },
    {
      token: 'punctuation.definition.string.begin',
      foreground: draculaColors.tempQuotes,
    },
    {
      token: 'punctuation.definition.string.end',
      foreground: draculaColors.tempQuotes,
    },
    {
      token: 'punctuation.support.type.property-name.begin',
      foreground: draculaColors.tempPropertyQuotes,
    },
    {
      token: 'punctuation.support.type.property-name.end',
      foreground: draculaColors.tempPropertyQuotes,
    },
    {
      token:
        'punctuation.definition.attribute-selector.begin.bracket.square.scss',
      foreground: draculaColors.foreground,
    },
    {
      token:
        'punctuation.definition.attribute-selector.end.bracket.square.scss',
      foreground: draculaColors.foreground,
    },

    // Strings
    { token: 'string', foreground: draculaColors.yellow },
    { token: 'string.html', foreground: draculaColors.yellow },
    { token: 'string.sql', foreground: draculaColors.yellow },
    { token: 'string.yaml', foreground: draculaColors.yellow },
    {
      token: 'string.quoted.docstring.multi',
      foreground: draculaColors.comment,
    },
    {
      token:
        'string.quoted.docstring.multi.python punctuation.definition.string.begin',
      foreground: draculaColors.comment,
    },
    {
      token:
        'string.quoted.docstring.multi.python punctuation.definition.string.end',
      foreground: draculaColors.comment,
    },
    {
      token: 'string.quoted.docstring.multi.python constant.character.escape',
      foreground: draculaColors.comment,
    },

    // Variables
    { token: 'variable', foreground: draculaColors.foreground },
    { token: 'variable.predefined', foreground: draculaColors.pink },
    { token: 'variable.other.readwrite', foreground: draculaColors.orange },
    { token: 'variable.other.property', foreground: draculaColors.foreground },
    { token: 'source.shell variable.other', foreground: draculaColors.purple },

    // Language Built-ins
    { token: 'support', foreground: draculaColors.cyan, fontStyle: 'italic' },
    {
      token: 'support.function.magic',
      foreground: draculaColors.purple,
      fontStyle: 'regular',
    },
    {
      token: 'support.variable',
      foreground: draculaColors.purple,
      fontStyle: 'regular',
    },
    {
      token: 'support.function',
      foreground: draculaColors.pink,
      fontStyle: 'regular',
    },
    {
      token: 'support.type.property-name',
      foreground: draculaColors.pink,
      fontStyle: 'regular',
    },

    // Additional Tokens
    { token: 'log.error', foreground: draculaColors.red, fontStyle: 'bold' },
    {
      token: 'log.warning',
      foreground: draculaColors.yellow,
      fontStyle: 'bold',
    },
    {
      token: 'entity.other.inherited-class',
      foreground: draculaColors.cyan,
      fontStyle: 'italic',
    },
    {
      token: 'meta.scope.prerequisites.makefile',
      foreground: draculaColors.yellow,
    },
    { token: 'meta.attribute-selector.scss', foreground: draculaColors.yellow },
    { token: 'meta.preprocessor.haskell', foreground: draculaColors.comment },

    // Diffs
    { token: 'meta.diff', foreground: draculaColors.comment },
    { token: 'meta.diff.header', foreground: draculaColors.comment },
    { token: 'markup.inserted', foreground: draculaColors.green },
    { token: 'markup.deleted', foreground: draculaColors.red },
    { token: 'markup.changed', foreground: draculaColors.orange },
    {
      token: 'invalid.deprecated',
      foreground: draculaColors.foreground,
      fontStyle: 'underline italic',
    },
    { token: 'entity.name.filename', foreground: draculaColors.yellow },
    { token: 'markup.error', foreground: draculaColors.red },

    // Markdown / RST / Prose
    { token: 'markup.underline', fontStyle: 'underline' },
    {
      token: 'markup.bold',
      fontStyle: 'bold',
      foreground: draculaColors.orange,
    },
    {
      token: 'markup.heading',
      fontStyle: 'bold',
      foreground: draculaColors.purple,
    },
    {
      token: 'markup.italic',
      fontStyle: 'italic',
      foreground: draculaColors.yellow,
    },
    {
      token: 'beginning.punctuation.definition.list.markdown',
      foreground: draculaColors.cyan,
    },
    {
      token: 'beginning.punctuation.definition.quote.markdown',
      foreground: draculaColors.cyan,
    },
    {
      token: 'punctuation.definition.link.restructuredtext',
      foreground: draculaColors.cyan,
    },
    { token: 'markup.inline.raw', foreground: draculaColors.green },
    { token: 'markup.raw.restructuredtext', foreground: draculaColors.green },
    { token: 'markup.underline.link', foreground: draculaColors.cyan },
    { token: 'markup.underline.link.image', foreground: draculaColors.cyan },
    {
      token: 'meta.link.reference.def.restructuredtext',
      foreground: draculaColors.pink,
    },
    {
      token: 'punctuation.definition.directive.restructuredtext',
      foreground: draculaColors.pink,
    },
    { token: 'string.other.link.description', foreground: draculaColors.pink },
    { token: 'string.other.link.title', foreground: draculaColors.pink },
    {
      token: 'entity.name.directive.restructuredtext',
      foreground: draculaColors.yellow,
      fontStyle: 'italic',
    },
    {
      token: 'markup.quote',
      foreground: draculaColors.yellow,
      fontStyle: 'italic',
    },
    { token: 'meta.separator.markdown', foreground: draculaColors.comment },
    { token: 'fenced_code.block.language', foreground: draculaColors.green },
    {
      token: 'markup.raw.inner.restructuredtext',
      foreground: draculaColors.green,
    },
    {
      token:
        'markup.fenced_code.block.markdown punctuation.definition.markdown',
      foreground: draculaColors.green,
    },
    {
      token: 'punctuation.definition.constant.restructuredtext',
      foreground: draculaColors.purple,
    },
    {
      token: 'markup.heading.markdown punctuation.definition.string.begin',
      foreground: draculaColors.purple,
    },
    {
      token: 'markup.heading.markdown punctuation.definition.string.end',
      foreground: draculaColors.purple,
    },
    {
      token: 'meta.paragraph.markdown punctuation.definition.string.begin',
      foreground: draculaColors.foreground,
    },
    {
      token: 'meta.paragraph.markdown punctuation.definition.string.end',
      foreground: draculaColors.foreground,
    },
    {
      token:
        'markup.quote.markdown meta.paragraph.markdown punctuation.definition.string.begin',
      foreground: draculaColors.yellow,
    },
    {
      token:
        'markup.quote.markdown meta.paragraph.markdown punctuation.definition.string.end',
      foreground: draculaColors.yellow,
    },

    // Serializables / Config Languages
    {
      token: 'entity.name.function.target.makefile',
      foreground: draculaColors.cyan,
    },
    { token: 'entity.name.section.toml', foreground: draculaColors.cyan },
    { token: 'entity.name.tag.yaml', foreground: draculaColors.cyan },
    { token: 'variable.other.key.toml', foreground: draculaColors.cyan },
    { token: 'constant.other.date', foreground: draculaColors.orange },
    { token: 'constant.other.timestamp', foreground: draculaColors.orange },
    {
      token: 'variable.other.alias.yaml',
      foreground: draculaColors.green,
      fontStyle: 'italic underline',
    },

    // Language Extensions / Edge Cases
    // GraphQL
    {
      token: 'meta.selectionset.graphql.variable',
      foreground: draculaColors.yellow,
    },
    {
      token: 'meta.selectionset.graphql.meta.arguments.variable',
      foreground: draculaColors.foreground,
    },
    { token: 'entity.name.fragment.graphql', foreground: draculaColors.cyan },
    { token: 'variable.fragment.graphql', foreground: draculaColors.cyan },

    // Haskell Pragmas
    { token: 'meta.preprocessor.haskell', foreground: draculaColors.comment },

    // Log Files
    { token: 'log.error', foreground: draculaColors.red, fontStyle: 'bold' },
    {
      token: 'log.warning',
      foreground: draculaColors.yellow,
      fontStyle: 'bold',
    },

    // Makefile Prerequisites
    {
      token: 'meta.scope.prerequisites.makefile',
      foreground: draculaColors.yellow,
    },

    // SCSS Attribute Selectors
    { token: 'meta.attribute-selector.scss', foreground: draculaColors.yellow },
    {
      token:
        'punctuation.definition.attribute-selector.begin.bracket.square.scss',
      foreground: draculaColors.foreground,
    },
    {
      token:
        'punctuation.definition.attribute-selector.end.bracket.square.scss',
      foreground: draculaColors.foreground,
    },
  ],
  colors: {
    'editor.background': draculaColors.background,
    'editor.foreground': draculaColors.foreground,
    'editor.lineHighlightBackground': draculaColors.lineHighlight,
    'editor.selectionBackground': draculaColors.selection,
    'editor.inactiveSelectionBackground': 'rgba(68, 71, 90, 0.44)', // #44475A70
    'editorCursor.foreground': draculaColors.foreground,
    'editorWhitespace.foreground': draculaColors.nonText,
    'editorIndentGuide.background': draculaColors.lineHighlight,
    'editorIndentGuide.activeBackground': draculaColors.lineHighlight,
    'editor.selectionHighlightBackground': '#424450',
    'editor.wordHighlightBackground': 'rgba(139, 233, 253, 0.31)', // #8BE9FD50
    'editor.wordHighlightStrongBackground': 'rgba(80, 250, 123, 0.31)', // #50FA7B50
    'editor.findMatchBackground': 'rgba(255, 184, 108, 0.50)', // #FFB86C80
    'editor.findMatchHighlightBackground': 'rgba(255, 255, 165, 0.19)', // #FFFFA530
    'editorOverviewRuler.border': draculaColors.background,
    'editorHoverWidget.background': draculaColors.background,
    'editorHoverWidget.border': draculaColors.comment,
    'editorLineNumber.foreground': draculaColors.comment,
    'editorLineNumber.activeForeground': draculaColors.foreground,

    // Activity Bar
    'activityBar.background': draculaColors.bgLight,
    'activityBar.foreground': draculaColors.foreground,
    'activityBar.inactiveForeground': draculaColors.comment,
    'activityBar.border': draculaColors.bgDarker,
    'activityBar.activeBorder': withAlphaRGBA(draculaColors.pink, 80), // 'rgba(255, 121, 198, 0.80)'
    'activityBar.activeBackground': withAlphaRGBA(draculaColors.purple, 10), // 'rgba(189, 147, 249, 0.10)'

    // Side Bar
    'sideBar.background': draculaColors.bgDark,
    'sideBar.foreground': draculaColors.foreground,
    'sideBar.border': draculaColors.bgDarker,
    'sideBarTitle.foreground': draculaColors.foreground,
    'sideBarSectionHeader.background': draculaColors.bgDark,
    'sideBarSectionHeader.foreground': draculaColors.comment,
    'sideBarSectionHeader.border': draculaColors.bgDarker,

    // Status Bar
    'statusBar.background': draculaColors.bgDarker,
    'statusBar.foreground': draculaColors.foreground,
    'statusBar.debuggingBackground': draculaColors.red,
    'statusBar.debuggingForeground': draculaColors.bgDarker,
    'statusBar.noFolderBackground': draculaColors.bgDarker,
    'statusBar.noFolderForeground': draculaColors.foreground,
    'statusBarItem.prominentBackground': draculaColors.red,
    'statusBarItem.prominentHoverBackground': draculaColors.orange,

    // Panel
    'panel.background': draculaColors.background,
    'panel.border': draculaColors.purple,
    'panelTitle.activeBorder': draculaColors.pink,
    'panelTitle.activeForeground': draculaColors.foreground,
    'panelTitle.inactiveForeground': draculaColors.comment,

    // Badge
    'badge.foreground': draculaColors.foreground,
    'badge.background': draculaColors.selection,

    // Buttons
    'button.background': draculaColors.selection,
    'button.foreground': draculaColors.foreground,
    'button.secondaryBackground': draculaColors.background,
    'button.secondaryForeground': draculaColors.foreground,
    'button.secondaryHoverBackground': draculaColors.bgLight,

    // Dropdowns
    'dropdown.background': draculaColors.bgLight,
    'dropdown.border': draculaColors.bgDarker,
    'dropdown.foreground': draculaColors.foreground,

    // Inputs
    'input.background': draculaColors.background,
    'input.foreground': draculaColors.foreground,
    'input.border': draculaColors.bgDarker,
    'input.placeholderForeground': draculaColors.comment,
    'inputOption.activeBorder': draculaColors.purple,
    'inputValidation.infoBorder': draculaColors.pink,
    'inputValidation.warningBorder': draculaColors.orange,
    'inputValidation.errorBorder': draculaColors.red,

    // Scrollbars
    'scrollbar.shadow': draculaColors.background, // Adjust as needed
    'scrollbarSlider.activeBackground': 'rgba(255, 255, 255, 0.2)',
    'scrollbarSlider.background': 'rgba(255, 255, 255, 0.1)',
    'scrollbarSlider.hoverBackground': 'rgba(255, 255, 255, 0.2)',

    // Peek View
    'peekView.border': draculaColors.selection,
    'peekViewEditor.background': draculaColors.background,
    'peekViewEditorGutter.background': draculaColors.background,
    'peekViewEditor.matchHighlightBackground': 'rgba(241, 250, 140, 0.80)', // #F1FA8C80
    'peekViewResult.background': draculaColors.bgDark,
    'peekViewResult.fileForeground': draculaColors.foreground,
    'peekViewResult.lineForeground': draculaColors.foreground,
    'peekViewResult.matchHighlightBackground': 'rgba(241, 250, 140, 0.80)', // #F1FA8C80
    'peekViewResult.selectionBackground': draculaColors.selection,
    'peekViewResult.selectionForeground': draculaColors.foreground,
    'peekViewTitle.background': draculaColors.bgDarker,
    'peekViewTitleDescription.foreground': draculaColors.comment,
    'peekViewTitleLabel.foreground': draculaColors.foreground,

    // Merge Conflicts
    'merge.currentHeaderBackground': 'rgba(80, 250, 123, 0.90)', // #50FA7B90
    'merge.incomingHeaderBackground': 'rgba(189, 147, 249, 0.90)', // #BD93F990
    'merge.border': draculaColors.selection,
    'editorOverviewRuler.currentContentForeground': draculaColors.green,
    'editorOverviewRuler.incomingContentForeground': draculaColors.purple,

    // Explorer Colors
    'gitDecoration.modifiedResourceForeground': draculaColors.cyan,
    'gitDecoration.deletedResourceForeground': draculaColors.red,
    'gitDecoration.untrackedResourceForeground': draculaColors.green,
    'gitDecoration.ignoredResourceForeground': draculaColors.comment,
    'gitDecoration.conflictingResourceForeground': draculaColors.orange,

    // Editor Widgets
    'debugExceptionWidget.background': draculaColors.background,
    'debugExceptionWidget.border': draculaColors.comment,
    'editorMarkerNavigation.background': draculaColors.bgDark,
    'editorMarkerNavigationError.background': draculaColors.red,
    'editorMarkerNavigationWarning.background': draculaColors.orange,

    // Welcome Page
    'welcomePage.buttonBackground': draculaColors.background,
    'welcomePage.buttonHoverBackground': draculaColors.bgLight,
    'walkThrough.embeddedEditorBackground': draculaColors.bgDark,

    // Breadcrumbs
    'breadcrumb.foreground': draculaColors.comment,
    'breadcrumb.background': draculaColors.background,
    'breadcrumb.focusForeground': draculaColors.foreground,
    'breadcrumb.activeSelectionForeground': draculaColors.foreground,
    'breadcrumbPicker.background': draculaColors.bgDarker,

    // Quick Picker
    'pickerGroup.border': draculaColors.purple,
    'pickerGroup.foreground': draculaColors.cyan,

    // Debug Toolbar
    'debugToolBar.background': draculaColors.bgDark,

    // Settings Editor
    'settings.headerForeground': draculaColors.foreground,
    'settings.modifiedItemIndicator': draculaColors.orange,
    'settings.inactiveSelectedItemBorder': draculaColors.selection,
    'settings.dropdownBackground': draculaColors.bgDark,
    'settings.dropdownForeground': draculaColors.foreground,
    'settings.dropdownBorder': draculaColors.bgDarker,
    'settings.checkboxBackground': draculaColors.bgDark,
    'settings.checkboxForeground': draculaColors.foreground,
    'settings.checkboxBorder': draculaColors.bgDarker,
    'settings.textInputBackground': draculaColors.bgDark,
    'settings.textInputForeground': draculaColors.foreground,
    'settings.textInputBorder': draculaColors.bgDarker,
    'settings.numberInputBackground': draculaColors.bgDark,
    'settings.numberInputForeground': draculaColors.foreground,
    'settings.numberInputBorder': draculaColors.bgDarker,

    // Menu Separators
    'menu.separatorBackground': draculaColors.purple,

    // List Filter Widget
    'listFilterWidget.background': draculaColors.bgLight,
    'listFilterWidget.outline': draculaColors.bgLighter,
    'listFilterWidget.noMatchesOutline': draculaColors.red,
  },
};
