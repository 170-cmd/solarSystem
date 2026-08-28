/**
 * Общие «часы» симуляции.
 * App обновляет days в цикле requestAnimationFrame;
 * 2D-оррери читает их через пропсы, а 3D-сцена — напрямую
 * внутри useFrame (без лишних перерисовок React-дерева).
 */
export const simStore = { days: 0 };
