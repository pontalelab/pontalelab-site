/** エンティティの移動パターン別位置更新 */

/**
 * @param {object} entity - 移動対象エンティティ
 * @param {number} dt     - デルタ時間（秒）
 * @param {number} t      - ゲーム経過時間（秒）
 *
 * entity.direction（+1 または -1）が設定されている場合、水平方向の移動にだけ
 * 掛け合わせる。未設定時は従来どおり +1 として扱われるため、さかなつりモードの
 * 挙動には一切影響しない（うみそうじモードで、魚がゴミにぶつかって反転する際に使用）。
 */
export function updateEntityMovement(entity, dt, t) {
  const p = entity.movementParams;
  const dir = entity.direction ?? 1;

  switch (entity.movementType) {
    case "straight":
      entity.x += entity.speed * dir * dt;
      break;

    case "wave": {
      entity.x += entity.speed * dir * dt;
      const amp = p.amplitude ?? 30;
      const freq = p.frequency ?? 2;
      entity.y = entity.baseY + amp * Math.sin(freq * t + entity.tOffset);
      break;
    }

    case "slow":
      entity.x += entity.speed * (p.speedMultiplier ?? 0.7) * dir * dt;
      break;

    case "fast":
      entity.x += entity.speed * (p.speedMultiplier ?? 1.8) * dir * dt;
      break;

    case "dash":
      _updateDash(entity, dt, dir);
      break;

    case "float": {
      entity.x += entity.speed * dir * dt;
      const fAmp = p.amplitude ?? 20;
      const fFreq = p.frequency ?? 1.2;
      entity.y = entity.baseY + fAmp * Math.sin(fFreq * t + entity.tOffset);
      break;
    }

    default:
      entity.x += entity.speed * dir * dt;
  }
}

function _updateDash(entity, dt, dir) {
  const p = entity.movementParams;
  const st = entity.movementState;

  if (st.isDashing) {
    entity.x += (p.dashSpeed ?? 220) * dir * dt;
    st.dashTimeLeft -= dt;
    if (st.dashTimeLeft <= 0) {
      st.isDashing = false;
    }
  } else {
    entity.x += entity.speed * dir * dt;
    if (Math.random() < (p.dashChance ?? 0.03)) {
      st.isDashing = true;
      st.dashTimeLeft = p.dashDuration ?? 0.5;
    }
  }
}
