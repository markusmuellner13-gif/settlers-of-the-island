// Hand-drawn SVG icon set (40×40 viewBox) for resources, pieces and symbols.
// ICON_INNER holds raw inner markup so it can be injected into HTML <svg> wrappers
// or straight into <g> nodes on the SVG board.

export const ICON_INNER = {
  brick: `
    <rect x="12" y="11" width="16" height="9" rx="1.5" fill="#d4744a" stroke="#7a2f16" stroke-width="1.6"/>
    <rect x="4" y="22" width="15" height="9" rx="1.5" fill="#c9683e" stroke="#7a2f16" stroke-width="1.6"/>
    <rect x="21" y="22" width="15" height="9" rx="1.5" fill="#bd5a31" stroke="#7a2f16" stroke-width="1.6"/>
    <rect x="13.6" y="12.6" width="12.8" height="2.6" rx="1.3" fill="#fff" opacity=".32"/>
    <rect x="5.6" y="23.6" width="11.8" height="2.6" rx="1.3" fill="#fff" opacity=".26"/>
    <rect x="22.6" y="23.6" width="11.8" height="2.6" rx="1.3" fill="#fff" opacity=".2"/>`,

  lumber: `
    <g stroke="#5d3a17" stroke-width="2">
      <circle cx="13.5" cy="26.5" r="7" fill="#d8ad74"/>
      <circle cx="26.5" cy="26.5" r="7" fill="#d8ad74"/>
      <circle cx="20" cy="14.5" r="7" fill="#e0b87f"/>
    </g>
    <g fill="none" stroke="#a06a33" stroke-width="1.3">
      <circle cx="13.5" cy="26.5" r="3.8"/>
      <circle cx="26.5" cy="26.5" r="3.8"/>
      <circle cx="20" cy="14.5" r="3.8"/>
    </g>
    <g fill="#7a5226">
      <circle cx="13.5" cy="26.5" r="1.3"/>
      <circle cx="26.5" cy="26.5" r="1.3"/>
      <circle cx="20" cy="14.5" r="1.3"/>
    </g>`,

  wool: `
    <rect x="13" y="27" width="3.2" height="7" rx="1.6" fill="#4a423a"/>
    <rect x="23.8" y="27" width="3.2" height="7" rx="1.6" fill="#4a423a"/>
    <g fill="#f7f3e8" stroke="#c9c2b2" stroke-width="1.4">
      <circle cx="13" cy="22" r="6"/>
      <circle cx="20" cy="18.5" r="7"/>
      <circle cx="27" cy="22" r="6"/>
      <circle cx="20" cy="24.5" r="7"/>
    </g>
    <ellipse cx="28.5" cy="13" rx="2.6" ry="1.6" fill="#4a423a" transform="rotate(-28 28.5 13)"/>
    <circle cx="31.5" cy="15.5" r="4.6" fill="#4a423a"/>
    <circle cx="33.2" cy="14.4" r="1" fill="#fff"/>`,

  grain: `
    <path d="M20 35 V11" stroke="#b8860b" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <g fill="#f0c84a" stroke="#8a5f0e" stroke-width="1.2">
      <ellipse cx="20" cy="8.5" rx="2.6" ry="4.6"/>
      <ellipse cx="14.8" cy="14" rx="2.5" ry="4.4" transform="rotate(-38 14.8 14)"/>
      <ellipse cx="25.2" cy="14" rx="2.5" ry="4.4" transform="rotate(38 25.2 14)"/>
      <ellipse cx="14" cy="20.5" rx="2.5" ry="4.4" transform="rotate(-38 14 20.5)"/>
      <ellipse cx="26" cy="20.5" rx="2.5" ry="4.4" transform="rotate(38 26 20.5)"/>
      <ellipse cx="13.4" cy="27" rx="2.5" ry="4.4" transform="rotate(-38 13.4 27)"/>
      <ellipse cx="26.6" cy="27" rx="2.5" ry="4.4" transform="rotate(38 26.6 27)"/>
    </g>`,

  ore: `
    <path d="M7 31 L13 16 L19.5 20 L25 10 L33 31 Z" fill="#9aa0aa" stroke="#4f545c" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M13 16 L19.5 20 L16.5 31 L7 31 Z" fill="#7f8693"/>
    <path d="M25 10 L33 31 L24.5 31 Z" fill="#b3b9c4"/>
    <path d="M7 31 L13 16 L19.5 20 L25 10 L33 31 Z" fill="none" stroke="#4f545c" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M28 12.5 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2 Z" fill="#eef2f8"/>`,

  desert: `
    <ellipse cx="20" cy="33.5" rx="10" ry="2.6" fill="#b99a45" opacity=".55"/>
    <path d="M19 34 q 1.8 -9 .8 -16" stroke="#8a5a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="#4a8f3c">
      <path d="M20 18 q -7.5 -6 -12.5 -1.5 q 6.5 -.5 9.5 4 Z"/>
      <path d="M20 18 q 7.5 -6 12.5 -1.5 q -6.5 -.5 -9.5 4 Z"/>
      <path d="M20 18 q -5 -8.5 -.5 -12.5 q .5 6.5 3.5 9.5 Z"/>
      <path d="M20 18 q 6 -5.5 4.5 -11.5 q -4.5 4 -7 8.5 Z"/>
    </g>
    <circle cx="20" cy="18.5" r="1.8" fill="#6b4a1d"/>`,

  dev: `
    <rect x="11" y="7" width="18" height="26" rx="3" fill="#f6efdd" stroke="#7a5a2b" stroke-width="1.8"/>
    <path d="M20 12.5 l2 4.2 4.6 .6 -3.4 3.2 .9 4.6 -4.1 -2.3 -4.1 2.3 .9 -4.6 -3.4 -3.2 4.6 -.6 Z"
          fill="#e8a13c" stroke="#b8741a" stroke-width="1"/>
    <rect x="14.5" y="27" width="11" height="2" rx="1" fill="#c9b88a"/>`,

  anchor: `
    <circle cx="20" cy="9.5" r="3.2" fill="none" stroke="#fff" stroke-width="2.4"/>
    <path d="M20 12.7 V29 M13 18.5 H27 M10.5 22 q 1.5 7.5 9.5 8.5 q 8 -1 9.5 -8.5"
          fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
};

// Player pieces — drawn with currentColor so any player color applies via CSS.
export const PIECE_INNER = {
  road: `
    <g transform="rotate(-18 20 20)">
      <rect x="5" y="15" width="30" height="10" rx="4" fill="currentColor" stroke="rgba(0,0,0,.45)" stroke-width="1.6"/>
      <rect x="7.5" y="16.8" width="25" height="2.8" rx="1.4" fill="#fff" opacity=".3"/>
    </g>`,
  settlement: `
    <path d="M20 5 L33 16 L33 34 L7 34 L7 16 Z" fill="currentColor" stroke="rgba(0,0,0,.45)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M20 5 L33 16 L7 16 Z" fill="#000" opacity=".22"/>
    <rect x="16.8" y="25" width="6.4" height="9" rx="1.2" fill="#000" opacity=".32"/>
    <rect x="8.6" y="17.6" width="2.6" height="14.5" fill="#fff" opacity=".16"/>`,
  city: `
    <path d="M5 34 L5 18 L14 18 L14 8 L21.5 3 L29 8 L29 18 L35 18 L35 34 Z" fill="currentColor" stroke="rgba(0,0,0,.45)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M14 8 L21.5 3 L29 8 Z" fill="#000" opacity=".26"/>
    <rect x="18.8" y="11.5" width="5.4" height="5.4" rx="1" fill="#000" opacity=".3"/>
    <rect x="8.8" y="23" width="5.4" height="5.6" rx="1" fill="#000" opacity=".3"/>
    <rect x="25.8" y="23" width="5.4" height="5.6" rx="1" fill="#000" opacity=".3"/>
    <rect x="6.4" y="19.4" width="2.4" height="13.2" fill="#fff" opacity=".15"/>`,
};

// Terrain scenery drawn inside each hex (coordinates relative to hex center;
// hex radius is 58, the number token sits at (0, 8) r17, badge at (0, 38)).
export const TERRAIN_ART = {
  forest: `
    <rect x="-25" y="-15" width="4.4" height="8" fill="#5d3a17"/>
    <path d="M-23 -44 L-11 -15 L-35 -15 Z" fill="#1f4f22"/>
    <path d="M-23 -39 L-13.5 -17 L-32.5 -17 Z" fill="#3f8a42" opacity=".45"/>
    <rect x="10" y="-21" width="4" height="7" fill="#5d3a17"/>
    <path d="M12 -47 L22 -21 L2 -21 Z" fill="#1f4f22"/>
    <path d="M12 -43 L20 -23 L4 -23 Z" fill="#3f8a42" opacity=".45"/>
    <rect x="-3.6" y="-13" width="3.6" height="6" fill="#5d3a17"/>
    <path d="M-2 -32 L6 -13 L-10 -13 Z" fill="#23582a"/>
    <rect x="28.4" y="-12" width="3.2" height="5" fill="#5d3a17"/>
    <path d="M30 -28 L36.5 -12 L23.5 -12 Z" fill="#1f4f22"/>`,

  mountains: `
    <path d="M-40 -8 L-19 -42 L2 -8 Z" fill="#6e747f" stroke="#4f545c" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-25 -32 L-19 -42 L-13 -32 L-17 -35 L-20 -31 L-23 -34 Z" fill="#e9edf2"/>
    <path d="M-8 -8 L15 -47 L38 -8 Z" fill="#7d8593" stroke="#4f545c" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M8 -35 L15 -47 L22 -35 L17.5 -39 L14.5 -34 L11 -38 Z" fill="#eef2f8"/>
    <path d="M15 -47 L38 -8 L24 -8 Z" fill="#000" opacity=".12"/>`,

  hills: `
    <ellipse cx="-17" cy="-13" rx="21" ry="12" fill="#9c4423"/>
    <ellipse cx="-17" cy="-15" rx="18" ry="9" fill="#aa4f29"/>
    <ellipse cx="16" cy="-9" rx="24" ry="14" fill="#a84c28"/>
    <ellipse cx="16" cy="-11" rx="20" ry="10" fill="#b65730"/>
    <g stroke="#7a2f16" stroke-width="1.2">
      <rect x="1" y="-27" width="11" height="6" rx="1" fill="#d4744a"/>
      <rect x="13.5" y="-27" width="11" height="6" rx="1" fill="#c9683e"/>
      <rect x="7" y="-34" width="11" height="6" rx="1" fill="#dd7f55"/>
    </g>`,

  fields: `
    <g fill="none" stroke="#c89018" stroke-width="2.6" stroke-linecap="round" opacity=".85">
      <path d="M-30 -34 q 10 -5 20 0 t 20 0"/>
      <path d="M-38 -23 q 10 -5 20 0 t 20 0 t 18 0"/>
      <path d="M-42 -12 q 10 -5 20 0 t 20 0 t 22 0"/>
    </g>
    <g stroke="#8a5f0e" stroke-width="1.6" stroke-linecap="round">
      <path d="M30 -14 V-30"/><path d="M37 -12 V-26"/>
    </g>
    <g fill="#f0c84a" stroke="#8a5f0e" stroke-width="1">
      <ellipse cx="30" cy="-33" rx="2" ry="3.6"/>
      <ellipse cx="37" cy="-29" rx="1.8" ry="3.2"/>
    </g>`,

  pasture: `
    <path d="M-44 -4 q 16 -14 32 -5 q 16 -11 36 -3" fill="none" stroke="#7bae4b" stroke-width="3" opacity=".9" stroke-linecap="round"/>
    <g>
      <rect x="-20" y="-19" width="2.2" height="5" fill="#4a423a"/>
      <rect x="-13" y="-19" width="2.2" height="5" fill="#4a423a"/>
      <ellipse cx="-15.5" cy="-24" rx="8" ry="5.6" fill="#f7f3e8" stroke="#c9c2b2" stroke-width="1.2"/>
      <circle cx="-8" cy="-26.5" r="3" fill="#4a423a"/>
    </g>
    <g>
      <rect x="13.4" y="-32" width="1.8" height="4" fill="#4a423a"/>
      <rect x="19" y="-32" width="1.8" height="4" fill="#4a423a"/>
      <ellipse cx="17" cy="-36" rx="6.4" ry="4.6" fill="#f7f3e8" stroke="#c9c2b2" stroke-width="1.2"/>
      <circle cx="23" cy="-38" r="2.5" fill="#4a423a"/>
    </g>`,

  desert: `
    <g transform="translate(-21 -50) scale(1.05)">
      <path d="M19 34 q 1.8 -9 .8 -16" stroke="#8a5a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g fill="#4a8f3c">
        <path d="M20 18 q -7.5 -6 -12.5 -1.5 q 6.5 -.5 9.5 4 Z"/>
        <path d="M20 18 q 7.5 -6 12.5 -1.5 q -6.5 -.5 -9.5 4 Z"/>
        <path d="M20 18 q -5 -8.5 -.5 -12.5 q .5 6.5 3.5 9.5 Z"/>
        <path d="M20 18 q 6 -5.5 4.5 -11.5 q -4.5 4 -7 8.5 Z"/>
      </g>
      <circle cx="20" cy="18.5" r="1.8" fill="#6b4a1d"/>
    </g>
    <g fill="none" stroke="#c4a44e" stroke-width="2.4" stroke-linecap="round" opacity=".8">
      <path d="M-38 28 q 12 -9 24 0"/>
      <path d="M8 32 q 12 -9 26 0"/>
      <path d="M14 -28 q 10 -7 20 0"/>
    </g>
    <circle cx="32" cy="-40" r="6" fill="#f3d36b" opacity=".9"/>`,
};

export function resIcon(key, size = 22) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">${ICON_INNER[key]}</svg>`;
}

export function pieceIcon(piece, size = 30, color = null) {
  const style = color ? ` style="color:${color}"` : '';
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"${style} aria-hidden="true">${PIECE_INNER[piece]}</svg>`;
}
