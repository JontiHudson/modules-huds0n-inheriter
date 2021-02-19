import { ElementType } from 'react';

import { mergeObjects } from '@huds0n/utilities';

import { createComponent } from './createComponent';
import * as InheriterTypes from './types';

export function createInheritableComponent<E extends ElementType>(
  Component: E,

  mergePropsFn: <T>(props1: any, props2: any) => T = mergeObjects,
): InheriterTypes.InheritableComponent<E> {
  return createComponent(Component, {
    mergePropsFn,
  });
}

export { InheriterTypes };
