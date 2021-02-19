import React, { ElementType } from 'react';

import { mergeObjects, useMemo } from '@huds0n/utilities';
import * as Types from './types';

export function createComponent<E extends ElementType, P extends Types.Props>(
  Component: E,
  options: Types.InheritableOptions,
): Types.InheritableComponent<E, P> {
  const {
    mergePropsFn = mergeObjects,
    inheritedProps,
    scripts,
    presets,
    memo = false,
  } = options;

  let MergedComponent = getMergedComponent<E, P>(Component, options);

  if (memo) {
    // @ts-ignore
    MergedComponent = React.memo(MergedComponent);
  }

  const {
    $$typeof,
    compare,
    displayName,
    propTypes,
    render,
    type,
    ...assignedProps
  } = Component as any;

  const inheritableMethods: Types.InheritableMethods<E, P> = {
    addPresets: (newPresets) =>
      createComponent(Component, {
        ...options,
        presets: { ...presets, ...newPresets },
      }),
    addProps: (props) =>
      createComponent(Component, {
        ...options,
        inheritedProps: getPropsWithStatics(props, {
          inheritedProps,
          mergePropsFn,
          presets,
        }),
      }),
    addStatics: (statics) =>
      // @ts-ignore
      createComponent(getComponentWithStatics(Component, statics), options),
    addStyle: (style) =>
      createComponent(Component, {
        ...options,
        inheritedProps: mergePropsFn(inheritedProps, { style }),
      }),
    inject: (script) =>
      // @ts-ignore
      createComponent(Component, {
        ...options,
        scripts: scripts ? [...scripts, script] : [script],
      }),
    setMemo: (newMemo = true) =>
      createComponent(Component, { ...options, memo: newMemo }),
    _inheritedProps: inheritedProps,
    _memo: memo,
    _typescriptChecker: () => createComponent(Component, options),
  };

  return Object.assign(MergedComponent, assignedProps, inheritableMethods);
}

function getMergedComponent<E extends ElementType, P extends Types.Props>(
  Component: E,
  options: Types.InheritableOptions,
) {
  return React.forwardRef<Types.GetRef<E>, P>((props, ref) => {
    const mergedProps = getMergedProps(props, options);

    //@ts-ignore
    return <Component ref={ref} {...mergedProps} />;
  });
}

function getMergedProps<P extends Types.Props>(
  props: P,
  options: Types.InheritableOptions,
) {
  let mergedProps = useMemo(() => getPropsWithStatics<P>(props, options), [
    ...Object.values(props),
  ]);
  mergedProps = combinePropsWithScripts<P>(mergedProps, options);
  mergedProps = provideDebugging(props, mergedProps, options);

  return mergedProps;
}

function getPropsWithStatics<P extends Types.Props>(
  props: P,
  {
    inheritedProps,
    mergePropsFn = mergeObjects,
    presets,
  }: Types.InheritableOptions,
) {
  let formattedProps = props;

  if (presets) {
    // @ts-ignore
    formattedProps = Object.entries(props).reduce((acc, [key, prop]) => {
      if (presets[key]) {
        return mergePropsFn<P>(acc, presets[key]);
      } else {
        return mergePropsFn<P>(acc, { [key]: prop });
      }
    }, {});
  }

  return mergePropsFn<P>(inheritedProps, formattedProps);
}

function combinePropsWithScripts<P extends Types.Props>(
  props: P,
  { mergePropsFn = mergeObjects, presets, scripts }: Types.InheritableOptions,
) {
  if (!scripts) return props;

  return scripts.reduceRight((acc, script) => {
    let scriptProps = script(acc);

    if (!scriptProps) return acc;

    return useMemo(() => {
      if (presets && scriptProps) {
        let mergedPresetProps = {};
        for (const key in scriptProps) {
          if (scriptProps[key] && presets[key]) {
            mergedPresetProps = mergePropsFn<P>(
              mergedPresetProps,
              presets[key],
            );
          }
        }
        scriptProps = mergePropsFn(mergedPresetProps, scriptProps);
      }

      return scriptProps && scriptProps.__overwrite
        ? (scriptProps as P)
        : mergePropsFn(acc, scriptProps);
    }, [...Object.values(scriptProps), ...Object.values(acc)]);
  }, props);
}

function provideDebugging<P extends Types.Props>(
  props: P,
  mergedProps: P,
  { inheritedProps }: Types.InheritableOptions,
) {
  if (!mergedProps.__debug) return mergedProps;

  console.log('************************');
  typeof props.__debug === 'string'
    ? console.log(props.__debug, {
        inheritedProps,
        props,
        mergedProps,
      })
    : console.log({
        inheritedProps,
        props,
        mergedProps,
      });

  return {
    ...mergedProps,
    style: {
      ...mergedProps.style,
      borderColor: 'red',
      borderWidth: 2,
    },
  };
}

function getComponentWithStatics<E extends ElementType, P extends Types.Props>(
  Component: E,
  statics: Object,
) {
  return Object.assign(
    React.forwardRef<Types.GetRef<E>, P>((props, ref) => {
      // @ts-ignore
      return <Component ref={ref} {...props} />;
    }),
    statics,
  );
}
