// Hand-drawn SVG icon set (40×40 viewBox) for resources, pieces and symbols.
// ICON_INNER holds raw inner markup so it can be injected into HTML <svg> wrappers
// or straight into <g> nodes on the SVG board. Each icon carries its own <defs>;
// duplicate gradient ids are harmless because the definitions are identical.

export const ICON_INNER = {
  brick: `
    <defs>
      <linearGradient id="gIcoBrick" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8966c"/>
        <stop offset=".55" stop-color="#c75f33"/>
        <stop offset="1" stop-color="#92381a"/>
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="35.4" rx="15" ry="2.6" fill="#000" opacity=".18"/>
    <g stroke="#6e2a12" stroke-width="1.3" stroke-linejoin="round">
      <rect x="11.8" y="8.6" width="16.4" height="8.2" rx="1" fill="url(#gIcoBrick)"/>
      <rect x="3.6" y="18" width="15.6" height="8.2" rx="1" fill="url(#gIcoBrick)"/>
      <rect x="20.8" y="18" width="15.6" height="8.2" rx="1" fill="url(#gIcoBrick)"/>
      <rect x="7.8" y="27.4" width="15.6" height="8.2" rx="1" fill="url(#gIcoBrick)"/>
      <rect x="25" y="27.4" width="11.4" height="8.2" rx="1" fill="url(#gIcoBrick)"/>
    </g>
    <g fill="#fff" opacity=".4">
      <rect x="13.2" y="9.9" width="13.6" height="2.2" rx="1.1"/>
      <rect x="5" y="19.3" width="12.8" height="2.2" rx="1.1"/>
      <rect x="22.2" y="19.3" width="12.8" height="2.2" rx="1.1"/>
      <rect x="9.2" y="28.7" width="12.8" height="2.2" rx="1.1"/>
      <rect x="26.4" y="28.7" width="8.6" height="2.2" rx="1.1"/>
    </g>
    <g fill="#7a2f16" opacity=".55">
      <circle cx="17" cy="14.4" r=".8"/><circle cx="24" cy="13" r=".7"/>
      <circle cx="9" cy="23.6" r=".8"/><circle cx="29" cy="23.2" r=".7"/>
      <circle cx="14" cy="32.6" r=".8"/><circle cx="31" cy="32" r=".7"/>
    </g>`,

  lumber: `
    <defs>
      <radialGradient id="gIcoLog" cx=".38" cy=".35" r=".8">
        <stop offset="0" stop-color="#f3d8a6"/>
        <stop offset=".62" stop-color="#ddb076"/>
        <stop offset="1" stop-color="#b07c41"/>
      </radialGradient>
      <linearGradient id="gIcoBark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8a6132"/><stop offset="1" stop-color="#54330f"/>
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="35" rx="16" ry="2.8" fill="#000" opacity=".18"/>
    <rect x="5" y="22" width="30" height="9" rx="4.5" fill="url(#gIcoBark)"/>
    <rect x="8" y="9.6" width="24" height="9" rx="4.5" fill="url(#gIcoBark)"/>
    <g stroke="#4a2d10" stroke-width="1.5">
      <circle cx="13" cy="26.5" r="7.2" fill="url(#gIcoLog)"/>
      <circle cx="27" cy="26.5" r="7.2" fill="url(#gIcoLog)"/>
      <circle cx="20" cy="14" r="7.2" fill="url(#gIcoLog)"/>
    </g>
    <g fill="none" stroke="#a9743b" stroke-width="1.1" opacity=".9">
      <circle cx="13" cy="26.5" r="4.6"/><circle cx="13" cy="26.5" r="2.2"/>
      <circle cx="27" cy="26.5" r="4.6"/><circle cx="27" cy="26.5" r="2.2"/>
      <circle cx="20" cy="14" r="4.6"/><circle cx="20" cy="14" r="2.2"/>
    </g>
    <g stroke="#8a5a26" stroke-width=".9" opacity=".8">
      <path d="M13 19.5 V22"/><path d="M27 19.5 V22"/><path d="M20 7 V9.4"/>
      <path d="M8 24 l1.8 1.4"/><path d="M32 24 l-1.8 1.4"/>
    </g>`,

  wool: `
    <defs>
      <radialGradient id="gIcoWool" cx=".36" cy=".28" r=".95">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".68" stop-color="#efe8d7"/>
        <stop offset="1" stop-color="#cfc6ae"/>
      </radialGradient>
    </defs>
    <ellipse cx="20" cy="35.4" rx="14" ry="2.4" fill="#000" opacity=".18"/>
    <g fill="#3f3833">
      <rect x="12.6" y="27" width="3" height="7.4" rx="1.5"/>
      <rect x="24.4" y="27" width="3" height="7.4" rx="1.5"/>
    </g>
    <g fill="url(#gIcoWool)" stroke="#bdb49c" stroke-width="1.2">
      <circle cx="12.5" cy="22.5" r="5.6"/>
      <circle cx="27.5" cy="22.5" r="5.6"/>
      <circle cx="16" cy="17.5" r="6.2"/>
      <circle cx="24" cy="17.5" r="6.2"/>
      <circle cx="20" cy="23.5" r="7"/>
    </g>
    <ellipse cx="29" cy="12.4" rx="2.8" ry="1.7" fill="#3f3833" transform="rotate(-30 29 12.4)"/>
    <circle cx="32" cy="14.8" r="4.4" fill="#3f3833"/>
    <circle cx="33.6" cy="13.6" r="1" fill="#fff"/>
    <circle cx="33.9" cy="13.4" r=".45" fill="#1a1512"/>
    <path d="M30.4 17.6 q 1.6 1 3.2.2" stroke="#1a1512" stroke-width=".8" fill="none" stroke-linecap="round"/>`,

  grain: `
    <defs>
      <linearGradient id="gIcoGrain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffdf7e"/>
        <stop offset=".6" stop-color="#eebd3f"/>
        <stop offset="1" stop-color="#c08c12"/>
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="35.6" rx="11" ry="2.2" fill="#000" opacity=".18"/>
    <g stroke="#a4760c" stroke-width="2" fill="none" stroke-linecap="round">
      <path d="M20 35 V10"/>
      <path d="M14.5 35 Q 13.5 24 15.5 14"/>
      <path d="M25.5 35 Q 26.5 24 24.5 14"/>
    </g>
    <g fill="url(#gIcoGrain)" stroke="#8a5f0e" stroke-width="1">
      <ellipse cx="20" cy="7.6" rx="2.5" ry="4.4"/>
      <ellipse cx="15" cy="11.5" rx="2.3" ry="4.2" transform="rotate(-14 15 11.5)"/>
      <ellipse cx="25" cy="11.5" rx="2.3" ry="4.2" transform="rotate(14 25 11.5)"/>
      <ellipse cx="13.2" cy="17.5" rx="2.3" ry="4.2" transform="rotate(-18 13.2 17.5)"/>
      <ellipse cx="26.8" cy="17.5" rx="2.3" ry="4.2" transform="rotate(18 26.8 17.5)"/>
      <ellipse cx="19.9" cy="14.5" rx="2.4" ry="4.4"/>
    </g>
    <g stroke="#8a5f0e" stroke-width=".7" opacity=".75">
      <path d="M20 4.4 v6.4"/><path d="M19.9 11.2 v6.6"/>
      <path d="M14.4 8.6 l1.2 5.8"/><path d="M25.6 8.6 l-1.2 5.8"/>
    </g>
    <path d="M14 26.5 q 6 -3.4 12 0 q -6 3.4 -12 0 Z" fill="#c0392b" stroke="#8e2620" stroke-width="1"/>
    <path d="M15.5 26.1 q 4.5 -1.9 9 0" stroke="#e8a09a" stroke-width=".9" fill="none" opacity=".8"/>`,

  ore: `
    <defs>
      <linearGradient id="gIcoOre" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#cdd4e0"/>
        <stop offset=".5" stop-color="#939bab"/>
        <stop offset="1" stop-color="#565d6a"/>
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="34.6" rx="15" ry="2.6" fill="#000" opacity=".2"/>
    <path d="M6.5 31 L12.5 15.5 L19.5 19.5 L25 9.5 L33.5 31 Z"
          fill="url(#gIcoOre)" stroke="#3f444d" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12.5 15.5 L19.5 19.5 L16 31 L6.5 31 Z" fill="#5f6673" opacity=".85"/>
    <path d="M25 9.5 L33.5 31 L24 31 Z" fill="#c4cbd8" opacity=".8"/>
    <path d="M19.5 19.5 L25 9.5 L27.5 16 L22 24 Z" fill="#fff" opacity=".22"/>
    <g fill="#f5c542" stroke="#a87b14" stroke-width=".6">
      <circle cx="15" cy="24.5" r="1.7"/>
      <circle cx="22.5" cy="27.5" r="1.4"/>
      <circle cx="27.8" cy="22" r="1.5"/>
    </g>
    <path d="M28.5 11.5 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 Z" fill="#fff" opacity=".95"/>
    <path d="M10.5 18 l.7 1.5 1.5.7 -1.5.7 -.7 1.5 -.7 -1.5 -1.5 -.7 1.5 -.7 Z" fill="#fff" opacity=".7"/>`,

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
    <defs>
      <linearGradient id="gIcoDev" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fdf8ea"/><stop offset="1" stop-color="#e8dbb8"/>
      </linearGradient>
    </defs>
    <rect x="12.5" y="8.5" width="18" height="26" rx="3" fill="#b39042" opacity=".55" transform="rotate(8 21.5 21.5)"/>
    <rect x="11" y="7" width="18" height="26" rx="3" fill="url(#gIcoDev)" stroke="#7a5a2b" stroke-width="1.7"/>
    <path d="M20 12.5 l2 4.2 4.6 .6 -3.4 3.2 .9 4.6 -4.1 -2.3 -4.1 2.3 .9 -4.6 -3.4 -3.2 4.6 -.6 Z"
          fill="#e8a13c" stroke="#b8741a" stroke-width="1"/>
    <rect x="14.5" y="27" width="11" height="1.8" rx=".9" fill="#c9b88a"/>
    <rect x="16" y="30" width="8" height="1.8" rx=".9" fill="#d6c79e"/>`,

  anchor: `
    <circle cx="20" cy="9.5" r="3.2" fill="none" stroke="#fff" stroke-width="2.4"/>
    <path d="M20 12.7 V29 M13 18.5 H27 M10.5 22 q 1.5 7.5 9.5 8.5 q 8 -1 9.5 -8.5"
          fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
};

// Player pieces — drawn with currentColor so any player color applies via CSS.
export const PIECE_INNER = {
  road: `
    <g transform="rotate(-18 20 20)">
      <ellipse cx="20" cy="26.5" rx="16" ry="2.6" fill="#000" opacity=".22" stroke="none"/>
      <rect x="4" y="14" width="32" height="11" rx="3.2" fill="currentColor" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/>
      <rect x="5.6" y="15.4" width="28.8" height="3.6" rx="1.8" fill="#fff" opacity=".34" stroke="none"/>
      <rect x="5.6" y="21.6" width="28.8" height="2.4" rx="1.2" fill="#000" opacity=".22" stroke="none"/>
      <g stroke="rgba(0,0,0,.18)" stroke-width="1">
        <path d="M14 14.6 v9.8"/><path d="M26 14.6 v9.8"/>
      </g>
    </g>`,
  settlement: `
    <ellipse cx="20" cy="35" rx="15" ry="2.4" fill="#000" opacity=".22" stroke="none"/>
    <path d="M20 4 L34 16.5 L34 34 L6 34 L6 16.5 Z" fill="currentColor" stroke="rgba(0,0,0,.5)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M20 4 L34 16.5 L6 16.5 Z" fill="#000" opacity=".28" stroke="none"/>
    <path d="M20 4 L34 16.5 L31.6 16.5 L20 6.2 L8.4 16.5 L6 16.5 Z" fill="#fff" opacity=".3" stroke="none"/>
    <rect x="25.6" y="6.5" width="3.6" height="7" rx=".8" fill="#000" opacity=".4" stroke="none"/>
    <rect x="16.4" y="25" width="7.2" height="9" rx="1.2" fill="#3a2a18" opacity=".82" stroke="none"/>
    <circle cx="21.9" cy="29.8" r=".8" fill="#d8b46a" stroke="none"/>
    <rect x="9" y="19.5" width="6" height="5.4" rx=".8" fill="#ffe9a8" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
    <path d="M12 19.5 v5.4 M9 22.2 h6" stroke="rgba(0,0,0,.4)" stroke-width=".9"/>
    <rect x="25" y="19.5" width="6" height="5.4" rx=".8" fill="#ffe9a8" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
    <path d="M28 19.5 v5.4 M25 22.2 h6" stroke="rgba(0,0,0,.4)" stroke-width=".9"/>
    <rect x="6.9" y="17.6" width="2" height="15.4" fill="#fff" opacity=".18" stroke="none"/>`,
  city: `
    <ellipse cx="20" cy="35.2" rx="16.5" ry="2.4" fill="#000" opacity=".22" stroke="none"/>
    <path d="M4 34 L4 17 L13 17 L13 8 L20.5 3 L28 8 L28 17 L36 17 L36 34 Z"
          fill="currentColor" stroke="rgba(0,0,0,.5)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M13 8 L20.5 3 L28 8 Z" fill="#000" opacity=".3" stroke="none"/>
    <path d="M28 17 L36 17 L36 20 L28 20 Z" fill="#000" opacity=".18" stroke="none"/>
    <path d="M20.5 3 L28 8 L26 8 L20.5 4.4 L15 8 L13 8 Z" fill="#fff" opacity=".3" stroke="none"/>
    <path d="M20.5 3.4 V0.8 M20.5 0.8 L25 2 L20.5 3.4" stroke="#c0392b" stroke-width="1.4" fill="#c0392b" stroke-linejoin="round"/>
    <rect x="17.8" y="10.5" width="5.4" height="5.4" rx=".8" fill="#ffe9a8" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
    <path d="M20.5 10.5 v5.4 M17.8 13.2 h5.4" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>
    <rect x="7" y="21.5" width="5.2" height="5.4" rx=".8" fill="#ffe9a8" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
    <rect x="27.8" y="22" width="5.2" height="5" rx=".8" fill="#ffe9a8" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
    <rect x="16.6" y="25" width="7.8" height="9" rx="3.4" fill="#3a2a18" opacity=".82" stroke="none"/>
    <circle cx="22.5" cy="29.8" r=".8" fill="#d8b46a" stroke="none"/>
    <rect x="5.4" y="18.6" width="2" height="14.2" fill="#fff" opacity=".16" stroke="none"/>`,
};

// Shared gradient definitions injected once into the board SVG's <defs>.
export const BOARD_DEFS = `
  <radialGradient id="hexg-forest" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#43914a"/><stop offset=".62" stop-color="#2e6b30"/><stop offset="1" stop-color="#1d4521"/>
  </radialGradient>
  <radialGradient id="hexg-pasture" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#aedd76"/><stop offset=".62" stop-color="#8fc15c"/><stop offset="1" stop-color="#699540"/>
  </radialGradient>
  <radialGradient id="hexg-fields" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#f3cd5e"/><stop offset=".62" stop-color="#e2b33b"/><stop offset="1" stop-color="#b3820f"/>
  </radialGradient>
  <radialGradient id="hexg-hills" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#cd6f42"/><stop offset=".62" stop-color="#b5562e"/><stop offset="1" stop-color="#84391b"/>
  </radialGradient>
  <radialGradient id="hexg-mountains" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#aeb4bf"/><stop offset=".62" stop-color="#8a8f99"/><stop offset="1" stop-color="#5d626b"/>
  </radialGradient>
  <radialGradient id="hexg-desert" cx="38%" cy="30%" r="90%">
    <stop offset="0" stop-color="#eedca6"/><stop offset=".62" stop-color="#d9c789"/><stop offset="1" stop-color="#b29b58"/>
  </radialGradient>
  <radialGradient id="tokenGrad" cx="35%" cy="30%" r="85%">
    <stop offset="0" stop-color="#fdf4da"/><stop offset=".68" stop-color="#f0deb0"/><stop offset="1" stop-color="#d3b87e"/>
  </radialGradient>
  <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f2e3b6"/><stop offset="1" stop-color="#d3ba7d"/>
  </linearGradient>
  <linearGradient id="treeG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a8a40"/><stop offset="1" stop-color="#173d1b"/>
  </linearGradient>
  <linearGradient id="trunkG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a5226"/><stop offset="1" stop-color="#4a2d10"/>
  </linearGradient>
  <linearGradient id="rockG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#a3aab6"/><stop offset="1" stop-color="#5c626d"/>
  </linearGradient>
  <linearGradient id="duneG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ecd698"/><stop offset="1" stop-color="#c2a258"/>
  </linearGradient>
  <radialGradient id="woolBody" cx=".36" cy=".28" r=".95">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#efe8d7"/><stop offset="1" stop-color="#cfc6ae"/>
  </radialGradient>
`;

// Terrain scenery drawn inside each hex (coordinates relative to hex center;
// hex radius is 58, the number token sits at (0, 8) r17, badge at (0, 38)).
// Gradients reference ids from BOARD_DEFS (terrain art only renders on the board).
export const TERRAIN_ART = {
  forest: `
    <ellipse cx="-21" cy="-9" rx="16" ry="4" fill="#10290f" opacity=".3"/>
    <ellipse cx="14" cy="-15" rx="14" ry="3.6" fill="#10290f" opacity=".26"/>
    <ellipse cx="-1" cy="-7" rx="9" ry="2.6" fill="#10290f" opacity=".24"/>
    <g transform="translate(-22 -10)">
      <rect x="-2.3" y="-3" width="4.6" height="7" rx="1.6" fill="url(#trunkG)"/>
      <path d="M0 -36 L9 -22 L-9 -22 Z" fill="url(#treeG)"/>
      <path d="M0 -29 L11 -12 L-11 -12 Z" fill="url(#treeG)"/>
      <path d="M0 -21 L13 -2 L-13 -2 Z" fill="url(#treeG)"/>
      <path d="M0 -36 L-9 -22 L-6 -22 L0 -31 Z M0 -29 L-11 -12 L-7.5 -12 L0 -24 Z M0 -21 L-13 -2 L-9 -2 L0 -16 Z" fill="#6fbf63" opacity=".45"/>
    </g>
    <g transform="translate(13 -16)">
      <rect x="-2" y="-3" width="4" height="6.4" rx="1.4" fill="url(#trunkG)"/>
      <path d="M0 -32 L8 -19 L-8 -19 Z" fill="url(#treeG)"/>
      <path d="M0 -25 L9.6 -10 L-9.6 -10 Z" fill="url(#treeG)"/>
      <path d="M0 -18 L11.4 -2 L-11.4 -2 Z" fill="url(#treeG)"/>
      <path d="M0 -32 L-8 -19 L-5.4 -19 L0 -27.5 Z M0 -25 L-9.6 -10 L-6.6 -10 L0 -20.5 Z" fill="#6fbf63" opacity=".4"/>
    </g>
    <g transform="translate(-1 -8)">
      <rect x="-1.7" y="-2.6" width="3.4" height="5.2" rx="1.2" fill="url(#trunkG)"/>
      <path d="M0 -24 L7 -12.5 L-7 -12.5 Z" fill="url(#treeG)"/>
      <path d="M0 -17.5 L8.6 -1.6 L-8.6 -1.6 Z" fill="url(#treeG)"/>
    </g>
    <g transform="translate(30 -10)">
      <rect x="-1.5" y="-2.4" width="3" height="4.6" rx="1" fill="url(#trunkG)"/>
      <path d="M0 -19 L6 -9.5 L-6 -9.5 Z" fill="url(#treeG)"/>
      <path d="M0 -13.5 L7.2 -1.4 L-7.2 -1.4 Z" fill="url(#treeG)"/>
    </g>
    <g fill="#2a5c2c">
      <ellipse cx="-36" cy="-6" rx="5" ry="3.2"/>
      <ellipse cx="22" cy="-4" rx="4.4" ry="2.8"/>
    </g>`,

  mountains: `
    <ellipse cx="0" cy="-6" rx="40" ry="5" fill="#3c4148" opacity=".28"/>
    <path d="M-42 -8 L-20 -43 L2 -8 Z" fill="url(#rockG)" stroke="#43474e" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M-20 -43 L2 -8 L-12 -8 Z" fill="#000" opacity=".18"/>
    <path d="M-27 -32 L-20 -43 L-13 -32 L-17.6 -36 L-20.6 -31 L-24 -34.6 Z" fill="#f2f5fa"/>
    <path d="M-20 -43 L-13 -32 L-17.6 -36 Z" fill="#cfd6df"/>
    <path d="M-9 -8 L15 -49 L39 -8 Z" fill="url(#rockG)" stroke="#43474e" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M15 -49 L39 -8 L23 -8 Z" fill="#000" opacity=".2"/>
    <path d="M7 -36 L15 -49 L23 -36 L18 -41 L14.6 -35 L10.6 -39.4 Z" fill="#f6f9fd"/>
    <path d="M15 -49 L23 -36 L18 -41 Z" fill="#d6dde6"/>
    <path d="M-9 -8 L15 -49 L18 -44 L-3 -8 Z" fill="#fff" opacity=".12"/>
    <g stroke="#4d525a" stroke-width="1" opacity=".6" fill="none">
      <path d="M-24 -22 l5 4 -3 6"/>
      <path d="M16 -28 l-5 6 4 7"/>
    </g>`,

  hills: `
    <ellipse cx="-17" cy="-9" rx="22" ry="11" fill="#8a3c1d"/>
    <ellipse cx="-17" cy="-11.5" rx="19" ry="8.6" fill="url(#hexg-hills)"/>
    <ellipse cx="-22" cy="-14.5" rx="9" ry="4" fill="#e09060" opacity=".5"/>
    <ellipse cx="17" cy="-6" rx="25" ry="13" fill="#8a3c1d"/>
    <ellipse cx="17" cy="-8.5" rx="21.5" ry="10" fill="url(#hexg-hills)"/>
    <ellipse cx="11" cy="-12.5" rx="10" ry="4.4" fill="#e09060" opacity=".5"/>
    <g stroke="#6e2a12" stroke-width="1.1">
      <rect x="0" y="-28" width="11" height="6" rx="1" fill="#d4744a"/>
      <rect x="12.5" y="-28" width="11" height="6" rx="1" fill="#c9683e"/>
      <rect x="6.2" y="-35" width="11" height="6" rx="1" fill="#dd7f55"/>
      <rect x="18.7" y="-35" width="5.6" height="6" rx="1" fill="#c05f35"/>
    </g>
    <g fill="#fff" opacity=".35">
      <rect x="1.4" y="-27" width="8.2" height="1.8" rx=".9"/>
      <rect x="7.6" y="-34" width="8.2" height="1.8" rx=".9"/>
    </g>
    <path d="M-31 -22 q 4 -7 11 -8" stroke="#6e2a12" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>`,

  fields: `
    <g fill="none" stroke="#c89018" stroke-width="3" stroke-linecap="round" opacity=".9">
      <path d="M-30 -36 q 10 -5 20 0 t 20 0"/>
      <path d="M-38 -25 q 10 -5 20 0 t 20 0 t 18 0"/>
      <path d="M-42 -14 q 10 -5 20 0 t 20 0 t 22 0"/>
    </g>
    <g fill="none" stroke="#9c6c08" stroke-width="1.4" stroke-linecap="round" opacity=".55">
      <path d="M-30 -33.4 q 10 -5 20 0 t 20 0"/>
      <path d="M-38 -22.4 q 10 -5 20 0 t 20 0 t 18 0"/>
      <path d="M-42 -11.4 q 10 -5 20 0 t 20 0 t 22 0"/>
    </g>
    <g stroke="#8a5f0e" stroke-width="1.6" stroke-linecap="round">
      <path d="M28 -12 V-28"/><path d="M35 -10 V-24"/><path d="M41 -13 V-26"/>
    </g>
    <g fill="#f0c84a" stroke="#8a5f0e" stroke-width="1">
      <ellipse cx="28" cy="-31" rx="2" ry="3.6"/>
      <ellipse cx="35" cy="-27" rx="1.8" ry="3.2"/>
      <ellipse cx="41" cy="-29" rx="1.8" ry="3.2"/>
    </g>
    <circle cx="-34" cy="-40" r="5" fill="#fff3c4" opacity=".8"/>`,

  pasture: `
    <path d="M-44 -4 q 16 -14 32 -5 q 16 -11 36 -3" fill="none" stroke="#7bae4b" stroke-width="3" opacity=".9" stroke-linecap="round"/>
    <g stroke="#5d8c39" stroke-width="1.4" stroke-linecap="round" opacity=".8">
      <path d="M-34 -14 l-2 -5 M-31.4 -14 l0 -5.6 M-29 -14 l2 -5"/>
      <path d="M28 -22 l-2 -4.6 M30.4 -22 l0 -5 M32.6 -22 l2 -4.6"/>
      <path d="M-6 -38 l-1.8 -4.4 M-3.6 -38 l0 -4.8 M-1.4 -38 l1.8 -4.4"/>
    </g>
    <g stroke="#8a6a3a" stroke-width="1.6">
      <path d="M-44 -26 h22 M-44 -21 h22"/>
      <path d="M-42 -29 v10 M-35 -29 v10 M-28 -29 v10 M-22 -29 v10"/>
    </g>
    <g>
      <ellipse cx="-15.5" cy="-15.5" rx="9" ry="2" fill="#3c6428" opacity=".4"/>
      <rect x="-20.5" y="-21" width="2.4" height="5.6" rx="1.1" fill="#3f3833"/>
      <rect x="-12.8" y="-21" width="2.4" height="5.6" rx="1.1" fill="#3f3833"/>
      <ellipse cx="-15.5" cy="-26" rx="8.4" ry="6" fill="url(#woolBody)" stroke="#bdb49c" stroke-width="1.1"/>
      <circle cx="-7.6" cy="-28.5" r="3.1" fill="#3f3833"/>
      <circle cx="-6.5" cy="-29.3" r=".75" fill="#fff"/>
      <ellipse cx="-10" cy="-30.4" rx="1.9" ry="1.1" fill="#3f3833" transform="rotate(-28 -10 -30.4)"/>
    </g>
    <g>
      <ellipse cx="17" cy="-29.5" rx="7" ry="1.6" fill="#3c6428" opacity=".4"/>
      <rect x="13" y="-34" width="2" height="4.6" rx=".9" fill="#3f3833"/>
      <rect x="19.4" y="-34" width="2" height="4.6" rx=".9" fill="#3f3833"/>
      <ellipse cx="17" cy="-38" rx="6.8" ry="4.9" fill="url(#woolBody)" stroke="#bdb49c" stroke-width="1.1"/>
      <circle cx="23.4" cy="-40" r="2.6" fill="#3f3833"/>
      <circle cx="24.3" cy="-40.7" r=".6" fill="#fff"/>
    </g>`,

  desert: `
    <path d="M-46 -2 q 14 -14 34 -8 q 22 -10 40 0 l 0 10 l -74 0 Z" fill="url(#duneG)" opacity=".65"/>
    <path d="M-46 -2 q 14 -14 34 -8" fill="none" stroke="#a8853d" stroke-width="1.6" opacity=".7"/>
    <path d="M-12 -10 q 22 -10 40 0" fill="none" stroke="#a8853d" stroke-width="1.6" opacity=".7"/>
    <g transform="translate(-21 -50) scale(1.05)">
      <path d="M19 34 q 1.8 -9 .8 -16" stroke="#8a5a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g fill="#4a8f3c">
        <path d="M20 18 q -7.5 -6 -12.5 -1.5 q 6.5 -.5 9.5 4 Z"/>
        <path d="M20 18 q 7.5 -6 12.5 -1.5 q -6.5 -.5 -9.5 4 Z"/>
        <path d="M20 18 q -5 -8.5 -.5 -12.5 q .5 6.5 3.5 9.5 Z"/>
        <path d="M20 18 q 6 -5.5 4.5 -11.5 q -4.5 4 -7 8.5 Z"/>
      </g>
      <g fill="#2f6b28" opacity=".5">
        <path d="M20 18 q -7.5 -6 -12.5 -1.5 q 6.5 -.5 9.5 4 Z"/>
      </g>
      <circle cx="20" cy="18.5" r="1.8" fill="#6b4a1d"/>
    </g>
    <g transform="translate(24 -24)">
      <path d="M0 8 V-8 q 0 -3 3 -3 t 3 3 V-4" fill="none" stroke="#3e7a3a" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M0 -2 V-7 q 0 -2.6 -2.6 -2.6 t -2.6 2.6 V-4.4" fill="none" stroke="#3e7a3a" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g fill="none" stroke="#c4a44e" stroke-width="2.2" stroke-linecap="round" opacity=".8">
      <path d="M-38 28 q 12 -9 24 0"/>
      <path d="M8 32 q 12 -9 26 0"/>
    </g>
    <circle cx="33" cy="-41" r="6.5" fill="#f7d96e"/>
    <circle cx="33" cy="-41" r="9.5" fill="#f7d96e" opacity=".3"/>`,
};

// Decorative sea elements drawn around the island (board coordinates).
export const SEA_DECOR = {
  wave: `
    <path d="M-14 0 q 7 -7 14 0 t 14 0" fill="none" stroke="#dff2ff" stroke-width="2.6" stroke-linecap="round"/>`,
  ship: `
    <path d="M-16 8 L16 8 L10 16 L-10 16 Z" fill="#7a4a22" stroke="#4a2d10" stroke-width="1.4"/>
    <path d="M-14.5 9.8 h29" stroke="#9c6433" stroke-width="1.4"/>
    <path d="M0 8 V-18" stroke="#4a2d10" stroke-width="2"/>
    <path d="M0 -18 Q 15 -12 2 -2 L 2 -18 Z" fill="#f6efdd" stroke="#c9b88a" stroke-width="1"/>
    <path d="M0 -18 Q -12 -13 -2 -4 L -2 -18 Z" fill="#efe4c8" stroke="#c9b88a" stroke-width="1"/>
    <path d="M0 -20 l6 2.6 -6 2.6 Z" fill="#c0392b"/>`,
  compass: `
    <circle r="15" fill="rgba(8,40,66,.45)" stroke="#bfdcf2" stroke-width="1.4"/>
    <circle r="11.4" fill="none" stroke="#bfdcf2" stroke-width=".7" opacity=".7"/>
    <path d="M0 -13 L3 0 L0 13 L-3 0 Z" fill="#e8e3d8"/>
    <path d="M0 -13 L3 0 L-3 0 Z" fill="#d64541"/>
    <path d="M-13 0 L0 3 L13 0 L0 -3 Z" fill="#bfdcf2" opacity=".85"/>
    <text y="-17.5" text-anchor="middle" font-size="8" fill="#dff2ff" font-weight="700">N</text>`,
  fish: `
    <path d="M-8 0 q 6 -6 13 0 q -7 6 -13 0 Z" fill="#bfdcf2" opacity=".9"/>
    <path d="M-8 0 l-5 -4.4 v8.8 Z" fill="#bfdcf2" opacity=".9"/>
    <circle cx="2" cy="-1" r=".9" fill="#0e3a5c"/>`,
  gulls: `
    <g fill="none" stroke="#eaf5ff" stroke-width="1.8" stroke-linecap="round" opacity=".9">
      <path d="M-12 0 q 4 -5 8 0 q 4 -5 8 0"/>
      <path d="M6 -9 q 3 -4 6 0 q 3 -4 6 0"/>
    </g>`,
};

export function resIcon(key, size = 22) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">${ICON_INNER[key]}</svg>`;
}

export function pieceIcon(piece, size = 30, color = null) {
  const style = color ? ` style="color:${color}"` : '';
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"${style} aria-hidden="true">${PIECE_INNER[piece]}</svg>`;
}
