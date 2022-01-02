import React, { ElementType } from 'react';

import { mergeEnumerableGetters, mergeObjects } from '@huds0n/utilities';
import * as Types from './types';

export function createComponent<E extends ElementType, P extends Types.Props>(
  Component: E,
  options: Types.InheritableOptions,
): Types.InheritableComponent<E, P> {
  const { inheritedProps, scripts, presets, memo = false } = options;

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

  const inheritableMethods = {
    addPresets: (newPresets: any) =>
      createComponent(Component, {
        ...options,
        presets: { ...presets, ...newPresets },
      }),
    addProps: (props: any) =>
      createComponent(Component, {
        ...options,
        inheritedProps: getPropsWithStatics(props, {
          inheritedProps,
          presets,
        }),
      }),
    addStyle: (style: any) =>
      createComponent(Component, {
        ...options,
        inheritedProps: mergeEnumerableGetters(inheritedProps, { style }),
      }),
    inject: (script: any) =>
      createComponent(Component, {
        ...options,
        scripts: scripts ? [...scripts, script] : [script],
      }),
    setMemo: (newMemo = true) =>
      createComponent(Component, { ...options, memo: newMemo }),
    _inheritedProps: inheritedProps,
    _memo: memo,
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
  let mergedProps = getPropsWithStatics<P>(props, options);
  mergedProps = combinePropsWithScripts<P>(mergedProps, options);
  mergedProps = provideDebugging(props, mergedProps, options);

  return mergedProps;
}

function getPropsWithStatics<P extends Types.Props>(
  props: P,
  { inheritedProps, presets }: Types.InheritableOptions,
) {
  let formattedProps = props;

  if (presets) {
    // @ts-ignore
    formattedProps = Object.entries(props).reduce((acc, [key, prop]) => {
      if (prop && presets[key]) {
        return mergeObjects<P>(acc, presets[key]);
      } else {
        return mergeObjects<P>(acc, { [key]: prop });
      }
    }, {});
  }

  return mergeObjects<P>(inheritedProps, formattedProps);
}

function combinePropsWithScripts<P extends Types.Props>(
  props: P,
  { presets, scripts }: Types.InheritableOptions,
) {
  if (!scripts) return props;

  return scripts.reduceRight((acc, script) => {
    let scriptProps = script(acc);

    if (!scriptProps) return acc;

    if (presets && scriptProps) {
      let mergedPresetProps = {};
      for (const key in scriptProps) {
        if (scriptProps[key] && presets[key]) {
          mergedPresetProps = mergeObjects<P>(mergedPresetProps, presets[key]);
        }
      }
      scriptProps = mergeObjects(mergedPresetProps, scriptProps);
    }

    return scriptProps && scriptProps.__overwrite
      ? (scriptProps as P)
      : mergeObjects(acc, scriptProps);
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
