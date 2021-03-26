/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, AlloyTriggers, Behaviour, Input, Keying, Memento } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { ToolbarGroup } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';

const buildContextFormGroups = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders): ToolbarGroup[] => {
  // Cannot use the FormField.sketch, because the DOM structure doesn't have a wrapping group
  const inputAttributes = ctx.label.fold(
    () => ({ }),
    (label) => ({ 'aria-label': label })
  );

  const memInput = Memento.record(
    Input.sketch({
      inputClasses: [ 'tox-toolbar-textfield', 'tox-toolbar-nav-js' ],
      data: ctx.initValue(),
      inputAttributes,
      selectOnFocus: true,
      inputBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'special',
          onEnter: (input) => commands.findPrimary(input).map((primary) => {
            AlloyTriggers.emitExecute(primary);
            return true;
          }),
          // These two lines need to be tested. They are about left and right bypassing
          // any keyboard handling, and allowing left and right to be processed by the input
          // Maybe this should go in an alloy sketch for Input?
          onLeft: (comp, se) => {
            se.cut();
            return Optional.none();
          },
          onRight: (comp, se) => {
            se.cut();
            return Optional.none();
          }
        })
      ])
    })
  );

  const commands = generate(memInput, ctx.commands, providers);

  return [
    {
      title: Optional.none(),
      items: [ memInput.asSpec() ]
    },
    {
      title: Optional.none(),
      items: commands.asSpecs() as AlloySpec[]
    }
  ];
};

export {
  buildContextFormGroups
};
