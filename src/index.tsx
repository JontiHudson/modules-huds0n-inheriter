import { ElementType } from "react";

import { createComponent } from "./createComponent";
import { Types } from "./types";

export function createInheritableComponent<E extends ElementType>(
  Component: E
): Types.InheritableComponent<E> {
  return createComponent(Component, {});
}

export type { Types as InheriterTypes };
