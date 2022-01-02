import { ElementType } from 'react';

import { createComponent } from './createComponent';
import * as InheriterTypes from './types';

export function createInheritableComponent<E extends ElementType>(
  Component: E,
): InheriterTypes.InheritableComponent<E> {
  return createComponent(Component, {});
}

export { InheriterTypes };
