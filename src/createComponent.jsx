"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const utilities_1 = require("@huds0n/utilities");
function createComponent(Component, options) {
    const { inheritedProps, scripts, presets, memo = false } = options;
    let MergedComponent = getMergedComponent(Component, options);
    if (memo) {
        MergedComponent = react_1.default.memo(MergedComponent);
    }
    const _a = Component, { $$typeof, compare, displayName, propTypes, render, type } = _a, assignedProps = (0, tslib_1.__rest)(_a, ["$$typeof", "compare", "displayName", "propTypes", "render", "type"]);
    const inheritableMethods = {
        addPresets: (newPresets) => createComponent(Component, Object.assign(Object.assign({}, options), { presets: Object.assign(Object.assign({}, presets), newPresets) })),
        addProps: (props) => createComponent(Component, Object.assign(Object.assign({}, options), { inheritedProps: getPropsWithStatics(props, {
                inheritedProps,
                presets,
            }) })),
        addStyle: (style) => createComponent(Component, Object.assign(Object.assign({}, options), { inheritedProps: (0, utilities_1.mergeEnumerableGetters)(inheritedProps, { style }) })),
        inject: (script) => createComponent(Component, Object.assign(Object.assign({}, options), { scripts: scripts ? [...scripts, script] : [script] })),
        setMemo: (newMemo = true) => createComponent(Component, Object.assign(Object.assign({}, options), { memo: newMemo })),
        _inheritedProps: inheritedProps,
        _memo: memo,
    };
    return Object.assign(MergedComponent, assignedProps, inheritableMethods);
}
exports.createComponent = createComponent;
function getMergedComponent(Component, options) {
    return react_1.default.forwardRef((props, ref) => {
        const mergedProps = getMergedProps(props, options);
        return <Component ref={ref} {...mergedProps}/>;
    });
}
function getMergedProps(props, options) {
    let mergedProps = getPropsWithStatics(props, options);
    mergedProps = combinePropsWithScripts(mergedProps, options);
    mergedProps = provideDebugging(props, mergedProps, options);
    return mergedProps;
}
function getPropsWithStatics(props, { inheritedProps, presets }) {
    let formattedProps = props;
    if (presets) {
        formattedProps = Object.entries(props).reduce((acc, [key, prop]) => {
            if (prop && presets[key]) {
                return (0, utilities_1.mergeObjects)(acc, presets[key]);
            }
            else {
                return (0, utilities_1.mergeObjects)(acc, { [key]: prop });
            }
        }, {});
    }
    return (0, utilities_1.mergeObjects)(inheritedProps, formattedProps);
}
function combinePropsWithScripts(props, { presets, scripts }) {
    if (!scripts)
        return props;
    return scripts.reduceRight((acc, script) => {
        let scriptProps = script(acc);
        if (!scriptProps)
            return acc;
        if (presets && scriptProps) {
            let mergedPresetProps = {};
            for (const key in scriptProps) {
                if (scriptProps[key] && presets[key]) {
                    mergedPresetProps = (0, utilities_1.mergeObjects)(mergedPresetProps, presets[key]);
                }
            }
            scriptProps = (0, utilities_1.mergeObjects)(mergedPresetProps, scriptProps);
        }
        return scriptProps && scriptProps.__overwrite
            ? scriptProps
            : (0, utilities_1.mergeObjects)(acc, scriptProps);
    }, props);
}
function provideDebugging(props, mergedProps, { inheritedProps }) {
    if (!mergedProps.__debug)
        return mergedProps;
    console.log("************************");
    typeof props.__debug === "string"
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
    return Object.assign(Object.assign({}, mergedProps), { style: Object.assign(Object.assign({}, mergedProps.style), { borderColor: "red", borderWidth: 2 }) });
}
