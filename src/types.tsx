import { ElementType, RefObject } from 'react';

export type Props = { [key: string]: any };
export type Script<
  P extends Props,
  IP extends Props,
  O extends Partial<P> | false | void = void
> = (props: IP & P) => O;

type InheriterProps = {
  __debug?: boolean | string;
};

export type GetRef<E extends ElementType> = E extends new (...args: any) => any
  ? InstanceType<E>
  : ExtractRef<GetProps<E>['ref']>;

type ExtractRef<O> = O extends RefObject<infer R> ? R : null;

export type GetProps<E extends ElementType> = E extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;

export type GetChildProps<P extends Props> = P extends { children: infer C }
  ? { children: C }
  : { children?: React.ReactNode | React.ReactNode[] };

export type ComponentProps<P extends Props> = Pick<
  P,
  Exclude<keyof P, 'ref' | '__debug'>
> &
  GetChildProps<P> &
  InheriterProps;

export type PropsAfterAdd<P extends Props, AP extends Partial<P>> = Pick<
  P,
  Exclude<keyof P, RequiredKeys<AP>>
> &
  Partial<Pick<P, Extract<keyof P, RequiredKeys<AP>>>>;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K;
}[keyof T];

export type ComponentStyle<P extends Props> = P extends {
  style?: infer s;
}
  ? s
  : undefined;

export type PresetsType<P extends Props> = Record<string, Partial<P>>;

export type PropsAfterPreset<P extends Props, Pr extends PresetsType<P>> = P &
  Partial<Record<keyof Pr, boolean>>;

export type InheritableOptions = {
  mergePropsFn?: <T>(props1: any, props2: any) => T;
  inheritedProps?: any;
  scripts?: Script<any, any, any>[];
  presets?: Record<string, Props>;
  memo?: boolean;
};

type GetAssignedProps<T extends ElementType> = T extends ElementType & infer A
  ? Omit<A, 'prototype' | 'context'>
  : {};

export type InheritableMethods<E extends ElementType, P extends Props> = {
  addPresets: <Pr extends PresetsType<P>>(
    presets: Pr,
  ) => InheritableComponent<E, PropsAfterPreset<P, Pr>>;
  addProps: <AP extends Partial<P>>(
    props: AP,
  ) => InheritableComponent<E, PropsAfterAdd<P, AP>>;
  addStatics: <S extends Object>(statics: S) => InheritableComponent<E & S, P>;
  addStyle: (style: ComponentStyle<P>) => InheritableComponent<E, P>;
  inject: <IP extends Props = {}, OP extends Partial<P> | false | void = {}>(
    script: Script<P, IP, OP>,
  ) => InheritableComponent<E, IP & P>;
  setMemo: (memoize?: boolean) => InheritableComponent<E, P>;
  _inheritedProps: P;
  _memo: boolean;
  _typescriptChecker: (
    props?: keyof P,
    requiredProps?: RequiredKeys<P>,
    ref?: keyof NonNullable<GetRef<E>>,
  ) => InheritableComponent<E, P>;
};

export type InheritableComponent<
  E extends ElementType,
  P extends Props = GetProps<E>
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComponentProps<P>> & React.RefAttributes<GetRef<E>>
> &
  InheritableMethods<E, P> &
  GetAssignedProps<E>;
