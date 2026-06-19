/** エンティティの移動パターン別位置更新 */

/**
 * @param {object} entity - 移動対象エンティティ
 * @param {number} dt     - デルタ時間（秒）
 * @param {number} t      - ゲーム経過時間（秒）
 */
export function updateEntityMovement(entity, dt, t) {
  const p = entity.movementParams;

  switch (entity.movementType) {
    case "straight":
      entity.x += entity.speed * dt;
      break;

    case "wave": {
      entity.x += entity.speed * dt;
      const amp = p.amplitude ?? 30;
      const freq = p.frequency ?? 2;
      entity.y = entity.baseY + amp * Math.sin(freq * t + entity.tOffset);
      break;
    }

    case "slow":
      entity.x += entity.speed * (p.speedMultiplier ?? 0.7) * dt;
      break;

    case "fast":
      entity.x += entity.speed * (p.speedMultiplier ?? 1.8) * dt;
      break;

    case "dash":
      _updateDash(entity, dt);
      break;

    case "float": {
      entity.x += entity.speed * dt;
      const fAmp = p.amplitude ?? 20;
      const fFreq = p.frequency ?? 1.2;
      entity.y = entity.baseY + fAmp * Math.sin(fFreq * t + entity.tOffset);
      break;
    }

    default:
      entity.x += entity.speed * dt;
  }
}

function _updateDash(entity, dt) {
  const p = entity.movementParams;
  const st = entity.movementState;

  if (st.isDashing) {
    entity.x += (p.dashSpeed ?? 220) * dt;
    st.dashTimeLeft -= dt;
    if (st.dashTimeLeft <= 0) {
      st.isDashing = false;
    }
  } else {
    entity.x += entity.speed * dt;
    if (Math.random() < (p.dashChance ?? 0.03)) {
      st.isDashing = true;
      st.dashTimeLeft = p.dashDuration ?? 0.5;
    }
  }
}
