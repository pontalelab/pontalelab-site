/** 網とエンティティの当たり判定 */

/**
 * クリック座標・網半径で当たっているエンティティを返す
 * @param {Array}  entities  - 検索対象エンティティ一覧
 * @param {number} cx        - 網の中心X（キャンバス座標）
 * @param {number} cy        - 網の中心Y（キャンバス座標）
 * @param {number} netRadius - 網の半径
 * @returns {Array} 捕まえたエンティティの配列
 */
export function findCaughtEntities(entities, cx, cy, netRadius) {
  const caught = [];
  for (const entity of entities) {
    if (!entity.active) continue;
    const ex = entity.x + entity.size.width / 2;
    const ey = entity.y + entity.size.height / 2;
    const dist = Math.hypot(cx - ex, cy - ey);
    const catchRadius = netRadius + Math.min(entity.size.width, entity.size.height) * 0.4;
    if (dist <= catchRadius) {
      caught.push(entity);
    }
  }
  return caught;
}
