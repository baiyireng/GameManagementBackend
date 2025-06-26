// 解析公式
export const evaluateFormula = (
    formula: string,
    context: Record<string, never>,
): number | boolean => {
    try {
        const fn = new Function(...Object.keys(context), `return ${formula}`);
        return fn(...Object.values(context));
    } catch (e) {
        console.error('表达式执行失败:', formula, e);
        return 0;
    }
};
