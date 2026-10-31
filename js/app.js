'use strict';

const $ = (selector, root = document) => root.querySelector(selector);

/** Create an element: el('input', { type: 'text' }, child1, child2) */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const key in attrs) {
    // `list` is read-only as a property, so it has to be set as an attribute
    if (key in node && key !== 'list') {
      node[key] = attrs[key];
    } else {
      node.setAttribute(key, attrs[key]);
    }
  }
  node.append(...children);
  return node;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  return text.replace(/[&<>]/g, (ch) => map[ch]);
}

const SCHEMA_TEXT = `
#Appearance
borderpx|n|4|0|20|1
border_radius|n|6|0|40|1
gappih|n|5|0|100|1
gappiv|n|5|0|100|1
gappoh|n|10|0|100|1
gappov|n|10|0|100|1
focused_opacity|n|1.0|0|1|0.05
unfocused_opacity|n|1.0|0|1|0.05
no_radius_when_single|b|0
no_border_when_single|b|0
smartgaps|b|0
rootcolor|c|0x201b14ff
bordercolor|c|0x444444ff
focuscolor|c|0xc9b890ff
urgentcolor|c|0xad401fff
maximizescreencolor|c|0x89aa61ff
scratchpadcolor|c|0x516c93ff
globalcolor|c|0xb153a7ff
overlaycolor|c|0x14a57cff
dropcolor|c|0x8FBA7C55
splitcolor|c|0xEB441EFF
scratchpad_width_ratio|n|0.8|0.1|1|0.05
scratchpad_height_ratio|n|0.9|0.1|1|0.05
#Shadows
shadows|b|0
layer_shadows|b|0
shadow_only_floating|b|1
shadows_size|n|10|0|100|1
shadows_blur|n|15|0|100|1
shadows_position_x|n|0|-100|100|1
shadows_position_y|n|0|-100|100|1
shadowscolor|c|0x000000ff
#Blur
blur|b|0
blur_layer|b|0
blur_optimized|b|1
blur_params_num_passes|n|2|1|8|1
blur_params_radius|n|5|0|30|1
blur_params_noise|n|0.02|0|0.2|0.01
blur_params_brightness|n|0.9|0|2|0.05
blur_params_contrast|n|0.9|0|2|0.05
blur_params_saturation|n|1.2|0|3|0.05
#Dimming
dim_enable|b|0
dim_focused_color|c|0x00000000
dim_unfocused_color|c|0x00000055
#Animations
animations|b|1
layer_animations|b|1
animation_type_open|o|slide|slide/zoom
animation_type_close|o|slide|slide/zoom
animation_fade_in|b|1
animation_fade_out|b|1
tag_animation_direction|o|1|1/0
zoom_initial_ratio|n|0.4|0|1|0.05
zoom_end_ratio|n|0.8|0|1|0.05
fadein_begin_opacity|n|0.5|0|1|0.05
fadeout_begin_opacity|n|0.8|0|1|0.05
animation_duration_move|n|500|0|3000|10
animation_duration_open|n|400|0|3000|10
animation_duration_tag|n|350|0|3000|10
animation_duration_close|n|800|0|3000|10
animation_duration_focus|n|0|0|3000|10
animation_curve_open|t|0.46,1.0,0.29,1
animation_curve_move|t|0.46,1.0,0.29,1
animation_curve_tag|t|0.46,1.0,0.29,1
animation_curve_close|t|0.08,0.92,0,1
animation_curve_focus|t|0.46,1.0,0.29,1
animation_curve_opafadeout|t|0.5,0.5,0.5,0.5
animation_curve_opafadein|t|0.46,1.0,0.29,1
#Layout: master-stack
new_is_master|b|1
default_mfact|n|0.55|0.1|0.9|0.01
default_nmaster|n|1|1|10|1
tag_num|n|9|1|9|1
#Layout: scroller
scroller_structs|n|20|0|100|1
scroller_default_proportion|n|0.8|0.1|1|0.05
scroller_default_proportion_single|n|1.0|0.1|1|0.05
scroller_focus_center|b|0
scroller_prefer_center|b|0
edge_scroller_pointer_focus|b|1
edge_scroller_focus_allow_speed|n|0.0|0|10|0.1
scroller_proportion_preset|t|0.5,0.8,1.0
#Layout: dwindle
dwindle_smart_split|b|0
dwindle_drop_simple_split|b|1
dwindle_manual_split|b|0
dwindle_hsplit|b|1
dwindle_vsplit|b|1
dwindle_preserve_split|b|0
#Overview
hotarea_size|n|10|0|100|1
enable_hotarea|b|0
hotarea_disable_on_fullscreen|b|1
overviewgappi|n|5|0|100|1
overviewgappo|n|30|0|100|1
overcircle_center_ratio|n|0.5|0|1|0.05
#Behavior
axis_bind_apply_timeout|n|100|0|1000|10
focus_on_activate|b|1
idleinhibit_ignore_visible|b|0
idleinhibit_when_fullscreen|b|0
sloppyfocus|b|1
warpcursor|b|1
focus_cross_monitor|b|0
focusdir_only_zone_overlap|b|1
focus_cross_tag|b|0
enable_floating_snap|b|0
snap_distance|n|30|0|200|1
float_full_to_top|b|0
cursor_size|n|24|8|96|1
drag_tile_to_tile|b|1
drag_tile_small|b|1
#Keyboard
repeat_rate|n|25|1|100|1
repeat_delay|n|600|100|2000|10
numlockon|b|0
xkb_rules_layout|t|us
#Trackpad
disable_trackpad|b|0
tap_to_click|b|1
tap_and_drag|b|1
drag_lock|b|1
trackpad_natural_scrolling|b|0
trackpad_disable_while_typing|b|1
trackpad_left_handed|b|0
trackpad_middle_button_emulation|b|0
swipe_min_threshold|n|1|0|50|1
#Mouse
mouse_natural_scrolling|b|0
`;

/** Parsed schema: [{ group, key, type, def, a, b, c }] */
const SCHEMA = [];
let currentGroup = '';

SCHEMA_TEXT.trim().split('\n').forEach((line) => {
  if (line[0] === '#') {
    currentGroup = line.slice(1);
    return;
  }
  const [key, type, def, a, b, c] = line.split('|');
  SCHEMA.push({ group: currentGroup, key, type, def, a, b, c });
});


/* ---------- 3. Keybinds ---------- */

const ACTIONS = [
  'spawn', 'killclient', 'quit', 'reload_config', 'focusdir', 'focusstack',
'exchange_client', 'togglefloating', 'togglefullscreen', 'togglefakefullscreen',
'togglemaximizescreen', 'toggleglobal', 'togglejump', 'toggleoverlay', 'minimized',
'restore_minimized', 'toggle_scratchpad', 'view', 'tag', 'tagsilent', 'viewtoleft',
'viewtoright', 'viewtoleft_have_client', 'viewtoright_have_client', 'tagtoleft',
'tagtoright', 'focusmon', 'tagmon', 'incgaps', 'togglegaps', 'movewin', 'resizewin',
'switch_layout', 'setlayout', 'set_proportion', 'switch_proportion_preset',
'scroller_stack', 'moveresize', 'enteroverview', 'leaveoverview',
'dwindle_toggle_split_direction',
];

function makeBind(type, mods, key, action, args = '') {
  return { type, mods, key, action, args };
}

/** Starting keybinds, taken from the example MangoWM config. */
function defaultBinds() {
  const binds = [];
  const add = (...args) => binds.push(makeBind('bind', ...args));

  add('SUPER', 'r', 'reload_config');
  add('ALT', 'space', 'spawn', 'rofi -show drun');
  add('ALT', 'Return', 'spawn', 'foot');
  add('SUPER', 'm', 'quit');
  add('ALT', 'q', 'killclient');
  add('SUPER', 'Tab', 'focusstack', 'next');

  // Arrow keys: focus, swap, move and resize windows
  const arrows = {
    Left:  { dir: 'left',  delta: '-50,+0' },
    Right: { dir: 'right', delta: '+50,+0' },
    Up:    { dir: 'up',    delta: '+0,-50' },
    Down:  { dir: 'down',  delta: '+0,+50' },
  };
  for (const key in arrows) {
    const { dir, delta } = arrows[key];
    add('ALT', key, 'focusdir', dir);
    add('SUPER+SHIFT', key, 'exchange_client', dir);
    add('CTRL+SHIFT', key, 'movewin', delta);
    add('CTRL+ALT', key, 'resizewin', delta);
  }

  // Window state toggles
  add('SUPER', 'g', 'toggleglobal');
  add('ALT', 'Tab', 'togglejump');
  add('ALT', 'backslash', 'togglefloating');
  add('ALT', 'a', 'togglemaximizescreen');
  add('ALT', 'f', 'togglefullscreen');
  add('ALT+SHIFT', 'f', 'togglefakefullscreen');
  add('SUPER', 'i', 'minimized');
  add('SUPER', 'o', 'toggleoverlay');
  add('SUPER+SHIFT', 'I', 'restore_minimized');
  add('ALT', 'z', 'toggle_scratchpad');
  add('SUPER', 'n', 'switch_layout');

  // Scroller layout
  add('ALT', 'e', 'set_proportion', '1.0');
  add('ALT', 'x', 'switch_proportion_preset');

  // Tags
  add('SUPER', 'Left', 'viewtoleft', '0');
  add('SUPER', 'Right', 'viewtoright', '0');
  for (let i = 1; i <= 9; i++) {
    add('CTRL', i, 'view', `${i},0`);
    add('ALT', i, 'tag', `${i},0`);
  }

  // Gaps
  add('ALT+SHIFT', 'X', 'incgaps', '1');
  add('ALT+SHIFT', 'Z', 'incgaps', '-1');
  add('ALT+SHIFT', 'R', 'togglegaps');

  // Mouse
  binds.push(
    makeBind('mousebind', 'SUPER', 'btn_left', 'moveresize', 'curmove'),
             makeBind('mousebind', 'NONE', 'btn_middle', 'togglemaximizescreen', '0'),
             makeBind('mousebind', 'SUPER', 'btn_right', 'moveresize', 'curresize'),
  );
  return binds;
}

/** Bind object -> config line */
function bindToLine(bind) {
  const args = bind.args !== '' ? `,${bind.args}` : '';
  return `${bind.type}=${bind.mods},${bind.key},${bind.action}${args}`;
}

/** Config value ("SUPER,r,spawn,foot") -> bind object. Arguments may contain commas. */
function parseBind(type, value) {
  const parts = value.split(',');
  return makeBind(
    type,
    (parts[0] || '').trim(),
                  (parts[1] || '').trim(),
                  (parts[2] || '').trim(),
                  parts.slice(3).join(',').trim(),
  );
}

/** Browser KeyboardEvent -> xkb-style key name used by MangoWM */
function keyName(event) {
  if (/^Key/.test(event.code)) return event.code.slice(3).toLowerCase();
  if (/^Digit/.test(event.code)) return event.code.slice(5);
  const names = {
    ' ': 'space', Enter: 'Return',
    ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down',
    '\\': 'backslash', '/': 'slash', '-': 'minus', '=': 'equal',
  };
  return names[event.key] || event.key;
}


/* ---------- 4. Terminal / bar data ---------- */

const PALETTE_NAMES = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White'];
const ANSI_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

/** Theme presets: [background, foreground, ...8 ANSI colors] */
const THEMES = {
  'Mango warm': ['#201b14', '#e6dcc6', '#2b241b', '#c9593a', '#89aa61', '#d9b45a', '#6f8fb8', '#b153a7', '#3fb8a0', '#d8cdb5'],
  'Nord':       ['#2e3440', '#d8dee9', '#3b4252', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#88c0d0', '#e5e9f0'],
  'Mocha':      ['#1e1e2e', '#cdd6f4', '#45475a', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#bac2de'],
};

/** ASCII logos for the neofetch window */
const LOGOS = {
  arch: {
    name: 'Arch Linux',
    art: String.raw`                 .o+'
                'ooo/
               '+oooo:
              '+oooooo:
              -+ooo0oo+:
            '/:-:++oooo+:
           '/+67+/+++++++:
          '/++++++++++++++:
         '/+++ларпoooooooo/'
        ./ooosssso++oлинусo+'
       .oossssso-''''/ossssss+'
      -osssssso.      :газsssso.
     :osssssss/        osssso+++.
    /редхатss/        +ssssssooo/-
  '/ossssso+/:-        -:/+osssso+-
 '+sso+:-'                 '.-/+oso:
'++:.                           '-/+/
.'                                 '/
    `.trimEnd(),
  },
  unknown: {
    name: 'Unknown',
    art: String.raw`       ________
   _jgN########Ngg_
 _N##N@@""  ""9NN##Np_
d###P            N####p
"^^"              T####
                  d###P
               _g###@F
            _gN##@P
          gN###F"
         d###F
        0###F
        0###F
        0###F
        "NN@'

         ___
        q###r
         ""`,
  },
  gentoo: {
    name: 'Gentoo Linux',
    art: String.raw`        -/oyddmdhs+:.
     -o2dNMMMMMMMMNNmhy+1-
   -y2NMMMMMMMMMMMNNNmmdhy1+-
 o2mMMMMMMMMMMMMNmdmmmmddhhy1/
 om2MMMMMMMMMMMN1hhyyyo2hmdddhhhd1o
.y2dMMMMMMMMMMd1hs++so/s2mdddhhhhdm1+
 oy2hdmNMMMMMMMN1dyooy2dmddddhhhhyhN1d.
  :o1yhhdNNMMMMMMMNNNmmdddhhhhhyym1Mh
    .:1+sydNMMMMMNNNmmmdddhhhhhhmM1my
       /m2MMMMMMNNNmmmdddhhhhhmMNh1s:
    o2NMMMMMMMNNNmmmddddhhdmMNhs1+
  s2NMMMMMMMMNNNmmmdddddmNMmhs1/.
 /N2MMMMMMMMNNNNmmmdddmNMNdso1:
+M2MMMMMMNNNNNmmmmdmNMNdso1/-
yM2MNNNNNNNmmmmmNNMmhs+1-
/h2MMNNNNNNNNMNdhs++1-
/2ohdmmddhys+++/:1.
  -//////:--.`,
  },
  none: { name: 'Unknown', art: '' },
};

/** Bar modules: [id, label, default section] */
const BAR_MODULES = [
  ['tags',    'Workspaces',   'left'],
  ['window',  'Window title', 'left'],
  ['clock',   'Clock',        'center'],
  ['cpu',     'CPU',          'right'],
  ['memory',  'Memory',       'right'],
  ['network', 'Network',      'right'],
  ['volume',  'Volume',       'right'],
  ['battery', 'Battery',      'right'],
  ['tray',    'Tray',         'right'],
];

/** Waybar module names */
const WAYBAR_NAMES = {
  tags: 'dwl/tags', window: 'dwl/window', clock: 'clock', cpu: 'cpu', memory: 'memory',
  network: 'network', volume: 'pulseaudio', battery: 'battery', tray: 'tray',
};

/** Polybar modules: id -> [section name, section body]. The tray is a bar option, not a module. */
const POLYBAR_MODULES = {
  tags: ['xworkspaces', 'type = internal/xworkspaces\nlabel-active-foreground = ${colors.accent}\nlabel-active-padding = 1\nlabel-occupied-padding = 1'],
  window: ['xwindow', 'type = internal/xwindow\nlabel = %title:0:50:...%'],
  clock: ['date', 'type = internal/date\ninterval = 1\ndate = %H:%M\nlabel = %date%'],
  cpu: ['cpu', 'type = internal/cpu\ninterval = 2\nlabel = CPU %percentage%%'],
  memory: ['memory', 'type = internal/memory\ninterval = 3\nlabel = RAM %gb_used%'],
  network: ['wlan', 'type = internal/network\ninterface-type = wireless\nlabel-connected = %essid% %signal%%'],
  volume: ['pulseaudio', 'type = internal/pulseaudio\nlabel-volume = VOL %percentage%%'],
  battery: ['battery', 'type = internal/battery\nbattery = BAT0\nadapter = AC\nlabel-discharging = BAT %percentage%%'],
};


/* ---------- 5. State and persistence ---------- */

const state = {
  // MangoWM options: key -> value (as text, exactly as written in the config)
  mango: Object.fromEntries(SCHEMA.map((s) => [s.key, s.def])),
           binds: defaultBinds(),
           // Lines kept as-is: tagrule, layerrule, exec, ...
           extraLines: [
             ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `tagrule=id:${i},layout_name:tile`),
           'layerrule=animation_type_open:zoom,layer_name:rofi',
           'layerrule=animation_type_close:zoom,layer_name:rofi',
           ].join('\n'),
           term: {
             shell: 'foot',          // alacritty | foot | kitty
             font: 'JetBrains Mono',
             size: 16,               // relative to a virtual 1600px-wide screen
             opacity: 0.92,
             padding: 12,
             bg: THEMES['Mango warm'][0],
             fg: THEMES['Mango warm'][1],
             colors: THEMES['Mango warm'].slice(2),
           },
           bar: {
             enabled: true,          // false = no bar at all
             kind: 'waybar',         // waybar | polybar
             position: 'top',
             height: 30,
             margin: 6,
             radius: 8,
             bg: '#201b14',
             alpha: 0.9,
             fg: '#e6dcc6',
             accent: '#c9b890',
             font: 'JetBrains Mono',
             size: 13,
             sections: Object.fromEntries(BAR_MODULES.map(([id, , section]) => [id, section])),
           },
           logo: 'arch',
           customLogo: '',
           target: 'mango',          // which generated file is shown on the Export tab
           wallpaperUrl: '',
           // Text the user adds to the end of each generated file: target id -> text
           additions: {},
};

const STORAGE_KEY = 'nitroglycerin';

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    Object.assign(state.mango, saved.mango);
    Object.assign(state.term, saved.term);
    Object.assign(state.bar, saved.bar);
    if (saved.additions) state.additions = saved.additions;
    if (saved.binds) state.binds = saved.binds;
    ['extraLines', 'logo', 'customLogo', 'target'].forEach((key) => {
      if (saved[key] != null) state[key] = saved[key];
    });
  } catch {
    // Storage is unavailable or the data is corrupted: keep the defaults
  }
}

function saveState() {
  try {
    const { mango, binds, extraLines, term, bar, logo, customLogo, target, additions } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mango, binds, extraLines, term, bar, logo, customLogo, target, additions }));
  } catch {
    // Ignore: saving is optional
  }
}

loadState();


/* ---------- 6. Color helpers ---------- */

/** "0xRRGGBBAA" -> "rgba(r,g,b,a)" */
function mangoColorToCss(value) {
  const hex = value.replace('0x', '').padEnd(8, 'f');
  const channel = (i) => parseInt(hex.substr(i, 2), 16);
  return `rgba(${channel(0)},${channel(2)},${channel(4)},${(channel(6) / 255).toFixed(2)})`;
}

/** "#rrggbb" + alpha -> "rgba(r,g,b,a)" */
function hexToCss(hex, alpha = 1) {
  const channel = (i) => parseInt(hex.slice(i, i + 2), 16);
  return `rgba(${channel(1)},${channel(3)},${channel(5)},${alpha})`;
}

const withoutHash = (hex) => hex.slice(1);
const alphaToHex = (alpha) => Math.round(alpha * 255).toString(16).padStart(2, '0');


/* ---------- 7. Preview rendering ---------- */

/** Fill the three terminal windows: neofetch, top, cat /etc/os-release */
function renderScreens() {
  const logo = state.logo === 'custom'
  ? { name: 'Custom Linux', art: state.customLogo || ' ' }
  : LOGOS[state.logo];
  const artLines = logo.art.split('\n');
  const artWidth = Math.max(...artLines.map((line) => line.length)) + 3;
  const shellName = { alacritty: 'alacritty', foot: 'foot', kitty: 'kitty' }[state.term.shell];

  const prompt = (command) => `<b class=c2>user@mango</b> <b class=c4>~</b> $ ${command}\n`;

  // --- neofetch: logo on the left, system info on the right ---
  const facts = [
    ['OS', `${logo.name} x86_64`],
    ['Host', 'nitroglycerin'],
    ['Kernel', 'X.XX.X'],
    ['Uptime', 'XX hours, X mins'],
    ['Packages', 'XXX'],
           ['Shell', 'Bash X.X.X'],
           ['WM', 'X'],
           ['Terminal', shellName],
           ['CPU', 'Intel Xeon E3-1230 V2 (8) @ 3.700GHz '],
           ['Memory', '6693MiB / 15948MiB'],
  ];
  const info = [
    '<b class=c2>user</b>@<b class=c2>mango</b>',
    '-----------',
    ...facts.map(([key, value]) => `<b class=c3>${key}</b>: ${value}`),
           '',
           [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<i class=c${i}>███</i>`).join(''),
  ];

  let neofetch = '';
  const rows = Math.max(artLines.length, info.length);
  for (let i = 0; i < rows; i++) {
    const artLine = escapeHtml((artLines[i] || '').padEnd(artWidth));
    neofetch += `<b class=c4>${artLine}</b>${info[i] || ''}\n`;
  }
  $('#w1').innerHTML = prompt('neofetch') + neofetch;

  // --- top ---
  const processes = [
    [1042, 'mango', 0.0, 0.0],
    [1310, 'waybar', 0.0, 0.0],
    [2217, shellName, 0.0, 0.0],
    [988, 'pipewire', 0.0, 0.0],
    [1, 'systemd', 0.0, 0.0],
  ];
  const processRows = processes
  .map(([pid, name, cpu, mem]) =>
  `${String(pid).padStart(5)} user      ${cpu.toFixed(1).padStart(4)} ${mem.toFixed(1).padStart(4)} ${name}`)
  .join('\n');

  $('#w2').innerHTML = prompt('top') +
  'top - XX:XX:XX up XX:XX,  X user,  load average: X.XX, X.XX, X.XX\n' +
  'Tasks: <b>XXX</b> total,   X running, XXX sleeping\n' +
  '%Cpu(s):  <b class=c2>X.X</b> us,  <b class=c3>X.X</b> sy, <b class=c4>XX.X</b> id\n' +
  'MiB Mem : XXXXX.X total,  XXXXX.X free,  XXXXX.X used\n\n' +
  '<span class=rv>  PID USER      %CPU %MEM COMMAND        </span>\n' +
  processRows;

  // --- cat /etc/os-release ---
  const osId = logo.name.toLowerCase().replace(/\W+/g, '');
  const osRelease = escapeHtml(
    `NAME="${logo.name}"\nPRETTY_NAME="${logo.name}"\nID=${osId}\nBUILD_ID=rolling\n` +
    `ANSI_COLOR="38;2;23;147;209"\nHOME_URL="https://example.org/"`,
  ).replace(/^(\w+)=/gm, '<b class=c3>$1</b>=');
  $('#w3').innerHTML = prompt('cat /etc/os-release') + osRelease;
}

/** Text shown for each bar module in the preview */
function barModuleText(id, mango) {
  if (id === 'tags') {
    const count = Math.min(+mango.tag_num || 9, 9);
    return Array.from({ length: count }, (_, i) => `<span class="tg${i === 0 ? ' a' : ''}"></span>`).join('');
  }
  return {
    window: 'user@mango: ~', clock: '14:52', cpu: 'CPU 4%', memory: 'RAM 3.2G',
    network: 'wifi 78%', volume: 'VOL 54%', battery: 'BAT 87%', tray: '• • •',
  }[id];
}

/**
 * Push all settings into CSS variables on the stage.
 * The virtual screen is 1600px wide: 1px of config = 0.0625cqw, so the
 * preview scales the same way at any size, including fullscreen.
 */
function renderPreview() {
  const mango = state.mango;
  const term = state.term;
  const bar = state.bar;
  const stage = $('#stage');

  const px = (n) => `${n * 0.0625}cqw`;
  const barAtTop = bar.position === 'top';
  const masterPercent = +mango.default_mfact * 100;
  const barSpace = bar.enabled ? px(+bar.height + 2 * bar.margin) : '0cqw';

  const vars = {
    // Window geometry
    '--bw': px(mango.borderpx),
           '--rad': px(mango.border_radius),
           '--gh': px(mango.gappih),
           '--gv': px(mango.gappiv),
           '--oh': px(mango.gappoh),
           '--ov': px(mango.gappov),
           '--cols': `minmax(0,${masterPercent}fr) minmax(0,${100 - masterPercent}fr)`,

           // Window look
           '--fc': mangoColorToCss(mango.focuscolor),
           '--bc': mangoColorToCss(mango.bordercolor),
           '--root': mangoColorToCss(mango.rootcolor),
           '--fo': mango.focused_opacity,
           '--uo': mango.unfocused_opacity,
           '--dim': mango.dim_enable == 1 ? mangoColorToCss(mango.dim_unfocused_color) : 'transparent',
           '--blur': mango.blur == 1 ? `blur(${px(mango.blur_params_radius * 2)})` : 'none',
           '--sh': mango.shadows == 1
           ? `${px(mango.shadows_position_x)} ${px(mango.shadows_position_y)} ${px(mango.shadows_blur)} ${px(mango.shadows_size)} ${mangoColorToCss(mango.shadowscolor)}`
           : 'none',

           // Terminal
           '--fs': px(term.size),
           '--pad': px(term.padding),
           '--tf': `"${term.font}",monospace`,
           '--tbg': hexToCss(term.bg, term.opacity),
           '--tfg': term.fg,

           // Bar
           '--bh': px(bar.height),
           '--bm': px(bar.margin),
           '--br': px(bar.radius),
           '--bbg': hexToCss(bar.bg, bar.alpha),
           '--bfg': bar.fg,
           '--bac': bar.accent,
           '--bf': `"${bar.font}",monospace`,
           '--bfs': px(bar.size),
           '--bt': barAtTop ? barSpace : '0cqw',
           '--bb': barAtTop ? '0cqw' : barSpace,
  };
  term.colors.forEach((color, i) => { vars[`--c${i}`] = color; });
  for (const name in vars) stage.style.setProperty(name, vars[name]);

  // Wallpaper
  stage.style.backgroundImage = state.wallpaperUrl ? `url(${state.wallpaperUrl})` : '';
  stage.style.backgroundSize = 'cover';
  stage.style.backgroundPosition = 'center';

  // Bar position and contents
  const barEl = $('#bar');
  barEl.hidden = !bar.enabled;
  barEl.style.top = barAtTop ? px(bar.margin) : 'auto';
  barEl.style.bottom = barAtTop ? 'auto' : px(bar.margin);
  barEl.innerHTML = ['left', 'center', 'right']
  .map((section) => {
    const modules = BAR_MODULES
    .filter(([id]) => bar.sections[id] === section)
    .map(([id]) => `<span>${barModuleText(id, mango)}</span>`)
    .join('');
    return `<div>${modules}</div>`;
  })
  .join('');

  renderScreens();
}


/* ---------- 8. Fullscreen preview ---------- */

/** Expand or collapse the preview with a smooth animation. */
function setFullscreen(open) {
  const stage = $('#stage');
  if (open === stage.classList.contains('full')) return;

  const target = $('#wrap').getBoundingClientRect();
  const inline = {
    top: `${target.top}px`, left: `${target.left}px`,
    width: `${target.width}px`, height: `${target.height}px`,
    borderRadius: '10px',
  };
  const fullscreen = {
    top: '0px', left: '0px',
    width: `${innerWidth}px`, height: `${innerHeight}px`,
    borderRadius: '0px',
  };

  if (open) stage.classList.add('full');
  document.body.classList.toggle('lock', open);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animation = stage.animate(open ? [inline, fullscreen] : [fullscreen, inline], {
    duration: reduceMotion ? 0 : 480,
    easing: 'cubic-bezier(.2,.8,.2,1)',
  });
  if (!open) animation.onfinish = () => stage.classList.remove('full');
}

$('#stage').onclick = () => setFullscreen(true);
$('#stage').onkeydown = (event) => {
  if (event.key === 'Enter' && event.target === event.currentTarget) setFullscreen(true);
};
$('#close').onclick = (event) => {
  event.stopPropagation();
  setFullscreen(false);
};
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setFullscreen(false);
});

$('#wall').onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.wallpaperUrl = URL.createObjectURL(file);
  renderPreview();
};
$('#nowall').onclick = () => {
  state.wallpaperUrl = '';
  renderPreview();
};


/* ---------- 9. Config generators ---------- */

function generateMango() {
  let out = '# generated by nitroglycerin\n';
  let group = '';
  SCHEMA.forEach((option) => {
    if (option.group !== group) {
      group = option.group;
      out += `\n# ${group}\n`;
    }
    out += `${option.key}=${state.mango[option.key]}\n`;
  });

  out += '\n# Key Bindings\n';
  out += state.binds.filter((bind) => bind.key).map(bindToLine).join('\n') + '\n';

  if (state.extraLines.trim()) {
    out += `\n# Rules\n${state.extraLines.trim()}\n`;
  }
  return out;
}

function generateAlacritty() {
  const t = state.term;
  return [
    '[window]',
    `opacity = ${t.opacity}`,
    `padding = { x = ${t.padding}, y = ${t.padding} }`,
    '',
    '[font]',
    `size = ${t.size}`,
    '',
    '[font.normal]',
    `family = "${t.font}"`,
    '',
    '[colors.primary]',
    `background = "${t.bg}"`,
    `foreground = "${t.fg}"`,
    '',
    '[colors.normal]',
    ...ANSI_NAMES.map((name, i) => `${name} = "${t.colors[i]}"`),
           '',
  ].join('\n');
}

function generateFoot() {
  const t = state.term;
  return [
    `font=${t.font}:size=${t.size}`,
    `pad=${t.padding}x${t.padding}`,
    '',
    '[colors]',
    `alpha=${t.opacity}`,
    `background=${withoutHash(t.bg)}`,
           `foreground=${withoutHash(t.fg)}`,
           ...t.colors.map((color, i) => `regular${i}=${withoutHash(color)}`),
           '',
  ].join('\n');
}

function generateKitty() {
  const t = state.term;
  return [
    `font_family ${t.font}`,
    `font_size ${t.size}`,
    `background_opacity ${t.opacity}`,
    `window_padding_width ${t.padding}`,
    `background ${t.bg}`,
    `foreground ${t.fg}`,
    ...t.colors.map((color, i) => `color${i} ${color}`),
           '',
  ].join('\n');
}

function modulesInSection(section) {
  return BAR_MODULES.filter(([id]) => state.bar.sections[id] === section).map(([id]) => id);
}

function generateWaybarConfig() {
  if (!state.bar.enabled) return '// The bar is disabled: do not launch waybar\n';
    const bar = state.bar;
  const config = {
    layer: 'top',
    position: bar.position,
    height: +bar.height,
    margin: +bar.margin,
    'modules-left': modulesInSection('left').map((id) => WAYBAR_NAMES[id]),
           'modules-center': modulesInSection('center').map((id) => WAYBAR_NAMES[id]),
           'modules-right': modulesInSection('right').map((id) => WAYBAR_NAMES[id]),
           'dwl/tags': { 'num-tags': +state.mango.tag_num },
           clock: { format: '{:%H:%M}' },
           cpu: { format: 'CPU {usage}%' },
           memory: { format: 'RAM {used:0.1f}G' },
           network: { 'format-wifi': '{essid} {signalStrength}%' },
           pulseaudio: { format: 'VOL {volume}%' },
           battery: { format: 'BAT {capacity}%' },
  };
  // The user's own entries are merged in and override generated ones
  return JSON.stringify({ ...config, ...parseWaybarAdditions() }, null, 2) + '\n';
}

function generateWaybarStyle() {
  if (!state.bar.enabled) return '/* The bar is disabled: do not launch waybar */\n';
  const bar = state.bar;
  return [
    `* { font-family: "${bar.font}", monospace; font-size: ${bar.size}px; border: none; min-height: 0; }`,
    `window#waybar { background: ${hexToCss(bar.bg, bar.alpha)}; color: ${bar.fg}; border-radius: ${bar.radius}px; }`,
           `#tags button { padding: 0 6px; color: ${bar.fg}; opacity: .5; border-radius: 4px; }`,
           `#tags button.focused { color: ${bar.accent}; opacity: 1; }`,
           '#tags button.urgent { background: #ad401f; }',
           '#window, #clock, #cpu, #memory, #network, #pulseaudio, #battery, #tray { padding: 0 10px; }',
           '',
  ].join('\n');
}

function generatePolybar() {
  if (!state.bar.enabled) return '; The bar is disabled: do not launch polybar\n';
  const bar = state.bar;
  const names = (section) => modulesInSection(section)
  .filter((id) => POLYBAR_MODULES[id])
  .map((id) => POLYBAR_MODULES[id][0])
  .join(' ');
  const usedModules = BAR_MODULES
  .map(([id]) => id)
  .filter((id) => bar.sections[id] !== 'off' && POLYBAR_MODULES[id]);
  const trayPosition = bar.sections.tray === 'left' ? 'left' : 'right';

  const lines = [
    '[colors]',
    `background = #${alphaToHex(bar.alpha)}${withoutHash(bar.bg)}`,
           `foreground = ${bar.fg}`,
           `accent = ${bar.accent}`,
           '',
           '[bar/main]',
           'width = 100%',
           `height = ${bar.height}`,
           ...(bar.position === 'bottom' ? ['bottom = true'] : []),
           `offset-y = ${bar.margin}`,
           `radius = ${bar.radius}`,
           'background = ${colors.background}',
           'foreground = ${colors.foreground}',
           `font-0 = ${bar.font}:size=${Math.round(bar.size * 0.75)};2`,
           'module-margin = 1',
           `modules-left = ${names('left')}`,
           `modules-center = ${names('center')}`,
           `modules-right = ${names('right')}`,
           ...(bar.sections.tray !== 'off' ? [`tray-position = ${trayPosition}`] : []),
           '',
  ];
  usedModules.forEach((id) => {
    const [name, body] = POLYBAR_MODULES[id];
    lines.push(`[module/${name}]`, body, '');
  });
  return lines.join('\n');
}

/** id -> [label, file name, generator] */
const TARGETS = {
  mango:     ['MangoWM', 'config.conf', generateMango],
  alacritty: ['alacritty', 'alacritty.toml', generateAlacritty],
  foot:      ['foot', 'foot.ini', generateFoot],
  kitty:     ['kitty', 'kitty.conf', generateKitty],
  waybar:    ['Waybar config', 'config.jsonc', generateWaybarConfig],
  waybarcss: ['Waybar style', 'style.css', generateWaybarStyle],
  polybar:   ['Polybar ( ignore this )', 'config.ini', generatePolybar],
};

/** Comment syntax of each generated file, used for the "Custom additions" header. */
const COMMENT = {
  mango:     (text) => `# ${text}`,
           alacritty: (text) => `# ${text}`,
           foot:      (text) => `# ${text}`,
           kitty:     (text) => `# ${text}`,
           waybar:    (text) => `// ${text}`,
           waybarcss: (text) => `/* ${text} */`,
           polybar:   (text) => `; ${text}`,
};

/** Waybar additions are JSON entries without the outer braces. */
function waybarAdditionsText() {
  return (state.additions.waybar || '').trim().replace(/,\s*$/, '');
}

/** Extra entries merged into the Waybar config. Returns {} when empty or invalid. */
function parseWaybarAdditions() {
  const text = waybarAdditionsText();
  if (!text) return {};
  try {
    return JSON.parse(`{${text}}`);
  } catch {
    return {};
  }
}

/** Error message for the additions field of a target, or '' when fine. */
function additionsError(target) {
  if (target !== 'waybar' || !waybarAdditionsText()) return '';
  try {
    JSON.parse(`{${waybarAdditionsText()}}`);
    return '';
  } catch (error) {
    return `Invalid JSON, additions are ignored: ${error.message}`;
  }
}

const isBarTarget = (target) => ['waybar', 'waybarcss', 'polybar'].includes(target);

/** The generated file plus the user's own additions. */
function buildOutput(target) {
  const base = TARGETS[target][2]();
  const extra = (state.additions[target] || '').trim();

  if (!extra) return base;
  if (target === 'waybar') return base;                    // merged inside the generator
  if (isBarTarget(target) && !state.bar.enabled) return base;

  return `${base.trimEnd()}\n\n${COMMENT[target]('Custom additions')}\n${extra}\n`;
}

/** Refresh the Export tab text, if it is open. */
function refreshOutput() {
  const box = $('#o');
  if (box) box.value = buildOutput(state.target);
}

/** Call after any change: redraws the preview, the generated file and saves. */
function update() {
  renderPreview();
  refreshOutput();
  saveState();
}


/* ---------- 10. Config import ---------- */

/** Detect the config type, load it into the state and return its name. */
function importConfig(text) {
  // MangoWM: key=value lines with known option names or binds
  if (/^\s*(bind|borderpx|border_radius|gappih|blur|animations)\s*=/m.test(text)) {
    const extra = [];
    const binds = [];

    text.split('\n').forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line[0] === '#') return;

      const eq = line.indexOf('=');
      if (eq < 0) return;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();

      if (/^(bind|mousebind|axisbind)$/.test(key)) {
        binds.push(parseBind(key, value));
      } else if (key in state.mango) {
        state.mango[key] = value;
      } else {
        extra.push(line); // tagrule, layerrule, gesturebind, exec-once, ...
      }
    });

    if (binds.length) state.binds = binds;
    state.extraLines = extra.join('\n');
    return 'MangoWM';
  }

  // Terminals: Alacritty, foot, kitty
  const term = state.term;
  const firstMatch = (...patterns) => {
    for (const pattern of patterns) {
      const found = text.match(pattern);
      if (found) return found[1].trim();
    }
  };
  const colorOf = (name) => {
    const pattern = new RegExp(`^\\s*${name}\\s*[= ]\\s*["']?(?:#|0x)?([0-9a-f]{6})`, 'mi');
    const found = text.match(pattern);
    return found && `#${found[1]}`;
  };

  if (/font_size\s/.test(text)) term.shell = 'kitty';
  else if (/^\[colors\]/m.test(text) || /^font=/m.test(text)) term.shell = 'foot';
  else term.shell = 'alacritty';

  const font = firstMatch(/font_family\s+(.+)/, /^font=([^:\n]+)/m, /family\s*=\s*"([^"]+)"/);
  const size = firstMatch(/font_size\s+([\d.]+)/, /size=([\d.]+)/, /size\s*=\s*([\d.]+)/);
  const opacity = firstMatch(/background_opacity\s+([\d.]+)/, /alpha=([\d.]+)/, /opacity\s*=\s*([\d.]+)/);
  const padding = firstMatch(/window_padding_width\s+(\d+)/, /pad=(\d+)/, /x\s*=\s*(\d+)/);

  if (font) term.font = font;
  if (size) term.size = +size;
  if (opacity) term.opacity = +opacity;
  if (padding) term.padding = +padding;

  term.bg = colorOf('background') || term.bg;
  term.fg = colorOf('foreground') || term.fg;
  term.colors = term.colors.map((current, i) =>
  colorOf(`color${i}`) || colorOf(`regular${i}`) || colorOf(ANSI_NAMES[i]) || current);

  return TARGETS[term.shell][0];
}


/* ---------- 11. Settings panels ---------- */

/** Labeled input bound to object[key]. */
function inputField(object, key, label, type = 'text', attrs = {}) {
  const input = el('input', { type, ...attrs });
  input.value = object[key];
  input.oninput = () => {
    const numeric = type === 'number' || type === 'range';
    object[key] = numeric ? +input.value : input.value;
    update();
  };
  return el('label', { className: 'f' }, el('span', {}, label), input);
}

/** Labeled dropdown bound to object[key]. options: [[value, label], ...] */
function selectField(object, key, label, options, onChange) {
  const select = el('select');
  options.forEach(([value, text]) => {
    select.append(new Option(text, value, false, value == object[key]));
  });
  select.onchange = () => {
    object[key] = select.value;
    if (onChange) onChange();
    else update();
  };
    return el('label', { className: 'f' }, el('span', {}, label), select);
}

/** Input control for one MangoWM option, depending on its type. */
function mangoControl(option) {
  const { key, type } = option;
  const value = state.mango[key];
  const set = (newValue) => {
    state.mango[key] = String(newValue);
    update();
  };

  if (type === 'b') {
    const checkbox = el('input', { type: 'checkbox', checked: value == '1' });
    checkbox.onchange = () => set(checkbox.checked ? 1 : 0);
    return checkbox;
  }

  if (type === 'c') {
    // 0xRRGGBBAA = color picker (RRGGBB) + alpha slider (AA)
    const hex = value.replace('0x', '');
    const picker = el('input', { type: 'color', value: `#${hex.slice(0, 6).toLowerCase()}` });
    const alpha = el('input', { type: 'range', min: 0, max: 255, value: parseInt(hex.slice(6) || 'ff', 16) });
    const apply = () => set(`0x${picker.value.slice(1)}${(+alpha.value).toString(16).padStart(2, '0')}`);
    picker.oninput = apply;
    alpha.oninput = apply;
    return el('span', { className: 'col' }, picker, alpha);
  }

  if (type === 'o') {
    const select = el('select');
    option.a.split('/').forEach((name) => select.append(new Option(name, name, false, name == value)));
    select.onchange = () => set(select.value);
    return select;
  }

  const input = type === 'n'
  ? el('input', { type: 'number', min: option.a, max: option.b, step: option.c, value })
  : el('input', { type: 'text', value });
  input.oninput = () => set(input.value);
  return input;
}

function mangoPanel() {
  const panel = el('div');
  panel.append(el('p', { className: 'note' },
                  'Defaults come from your config.conf. Anything that affects looks updates the preview instantly.'));

  let currentGroup = '';
  let section;
  SCHEMA.forEach((option) => {
    if (option.group !== currentGroup) {
      currentGroup = option.group;
      section = el('details', { open: currentGroup === 'Appearance' }, el('summary', {}, currentGroup));
      panel.append(section);
    }
    section.append(el('label', { className: 'f' }, el('span', {}, option.key), mangoControl(option)));
  });

  const rules = el('textarea', { rows: 8, value: state.extraLines, spellcheck: false });
  rules.oninput = () => {
    state.extraLines = rules.value;
    update();
  };
  panel.append(el('details', {}, el('summary', {}, 'Rules (tagrule, layerrule, exec...)'), rules));
  return panel;
}

function bindsPanel() {
  const panel = el('div');
  const search = el('input', { type: 'search', placeholder: 'Search binds' });
  const list = el('div');
  const actionList = el('datalist', { id: 'actions' }, ...ACTIONS.map((name) => new Option(name)));

  function drawRow(bind, index) {
    const textInput = (field, cls, placeholder, listId) => {
      const input = el('input', { value: bind[field], placeholder, className: cls, ...(listId ? { list: listId } : {}) });
      input.oninput = () => {
        bind[field] = input.value;
        update();
      };
      return input;
    };

    const type = el('select');
    ['bind', 'mousebind', 'axisbind'].forEach((name) => type.append(new Option(name, name, false, name === bind.type)));
    type.onchange = () => {
      bind.type = type.value;
      update();
    };

    const mods = textInput('mods', 's2', 'SUPER+SHIFT');
    const key = textInput('key', 's2', 'key');

    // "Record" captures the next key combination pressed
    const record = el('button', { className: 'btn g', type: 'button', textContent: 'Record' });
    record.onclick = () => {
      record.textContent = '...';
      const onKey = (event) => {
        event.preventDefault();
        if (/^(Control|Alt|Shift|Meta)$/.test(event.key)) return; // wait for a real key
        removeEventListener('keydown', onKey, true);

        const held = [
          event.metaKey && 'SUPER',
           event.ctrlKey && 'CTRL',
           event.altKey && 'ALT',
           event.shiftKey && 'SHIFT',
        ].filter(Boolean);
        bind.mods = held.join('+') || 'NONE';
        bind.key = keyName(event);
        mods.value = bind.mods;
        key.value = bind.key;
        record.textContent = 'Record';
        update();
      };
      addEventListener('keydown', onKey, true);
    };

    const remove = el('button', { className: 'btn g', type: 'button', textContent: '✕', title: 'Delete' });
    remove.onclick = () => {
      state.binds.splice(index, 1);
      drawList();
      update();
    };

    list.append(el('div', { className: 'br' },
                   type, mods, key, record,
                   textInput('action', 's2', 'action', 'actions'),
                   textInput('args', 's3', 'arguments'),
                   remove,
    ));
  }

  function drawList() {
    list.innerHTML = '';
    const filter = search.value.toLowerCase();
    state.binds.forEach((bind, index) => {
      if (filter && !bindToLine(bind).toLowerCase().includes(filter)) return;
      drawRow(bind, index);
    });
  }

  const add = el('button', { className: 'btn', type: 'button', textContent: 'Add bind' });
  add.onclick = () => {
    search.value = '';
    state.binds.unshift(makeBind('bind', 'SUPER', '', 'spawn', ''));
    drawList();
    $('.br input', list).focus();
    update();
  };

  search.oninput = drawList;
  drawList();
  panel.append(el('div', { className: 'row' }, add), search, actionList, list);
  return panel;
}

function terminalPanel() {
  const term = state.term;
  const panel = el('div');

  const customLogo = el('textarea', { rows: 8, value: state.customLogo, placeholder: 'Paste your own ASCII logo', spellcheck: false });
  customLogo.oninput = () => {
    state.customLogo = customLogo.value;
    update();
  };

  const themeSelect = el('select');
  themeSelect.append(new Option('Choose a theme...', ''));
  Object.keys(THEMES).forEach((name) => themeSelect.append(new Option(name, name)));
  themeSelect.onchange = () => {
    const theme = THEMES[themeSelect.value];
    if (!theme) return;
    [term.bg, term.fg] = theme;
    term.colors = theme.slice(2);
    showPanel();
    update();
  };

  panel.append(
    selectField(term, 'shell', 'Terminal', [['alacritty', 'alacritty'], ['foot', 'foot'], ['kitty', 'kitty']]),
               selectField(state, 'logo', 'ASCII logo',
                           [['arch', 'Arch'], ['unknown', 'Unknown'], ['gentoo', 'Gentoo'], ['none', 'No logo'], ['custom', 'Custom']],
                           () => { showPanel(); update(); }),
  );
  if (state.logo === 'custom') panel.append(customLogo);

  panel.append(
    el('label', { className: 'f' }, el('span', {}, 'Color theme'), themeSelect),
               inputField(term, 'font', 'Font', 'text', { list: 'fonts' }),
               el('datalist', { id: 'fonts' }, ...['JetBrains Mono', 'Fira Code', 'Iosevka', 'Hack', 'Cascadia Code'].map((name) => new Option(name))),
               inputField(term, 'size', 'Font size', 'number', { min: 8, max: 40 }),
               inputField(term, 'opacity', 'Opacity', 'range', { min: 0.3, max: 1, step: 0.01 }),
               inputField(term, 'padding', 'Inner padding', 'number', { min: 0, max: 60 }),
               inputField(term, 'bg', 'Background', 'color'),
               inputField(term, 'fg', 'Text', 'color'),
  );

  // The 8 ANSI palette colors
  PALETTE_NAMES.forEach((name, i) => {
    const picker = el('input', { type: 'color', value: term.colors[i] });
    picker.oninput = () => {
      term.colors[i] = picker.value;
      update();
    };
    panel.append(el('label', { className: 'f' }, el('span', {}, name), picker));
  });
  return panel;
}

function barPanel() {
  const bar = state.bar;
  const panel = el('div');

  const enabled = el('input', { type: 'checkbox', checked: bar.enabled });
  enabled.onchange = () => {
    bar.enabled = enabled.checked;
    showPanel();
    update();
  };
  panel.append(el('label', { className: 'f' }, el('span', {}, 'Show bar'), enabled));

  // Everything below is greyed out and disabled while the bar is off
  const settings = el('fieldset', { disabled: !bar.enabled });
  settings.append(
    selectField(bar, 'kind', 'Bar', [['waybar', 'Waybar'], ['polybar', 'Polybar']], () => {
      state.target = bar.kind;
      showPanel();
      update();
    }),
    el('p', { className: 'note' }, bar.kind === 'polybar'
    ? 'Polybar only works on X11. On Wayland use Waybar.'
    : 'Waybar uses the dwl/tags and dwl/window modules.'),
    selectField(bar, 'position', 'Position', [['top', 'Top'], ['bottom', 'Bottom']]),
                  inputField(bar, 'height', 'Height', 'number', { min: 12, max: 80 }),
                  inputField(bar, 'margin', 'Edge margin', 'number', { min: 0, max: 40 }),
                  inputField(bar, 'radius', 'Corner radius', 'number', { min: 0, max: 40 }),
                  inputField(bar, 'bg', 'Background', 'color'),
                  inputField(bar, 'alpha', 'Background opacity', 'range', { min: 0, max: 1, step: 0.01 }),
                  inputField(bar, 'fg', 'Text', 'color'),
                  inputField(bar, 'accent', 'Accent', 'color'),
                  inputField(bar, 'font', 'Font', 'text'),
                  inputField(bar, 'size', 'Font size', 'number', { min: 8, max: 30 }),
  );

  BAR_MODULES.forEach(([id, label]) => {
    settings.append(selectField(bar.sections, id, label,
                                [['left', 'Left'], ['center', 'Center'], ['right', 'Right'], ['off', 'Off']]));
  });

  panel.append(settings);
  return panel;
}

/** Placeholder text for the additions field of each file. */
const ADDITION_HINTS = {
  mango: 'exec-once=swaybg -i ~/Wallpaper.jpg',
  alacritty: '[cursor.style]\nshape = "Beam"',
  foot: '[cursor]\nstyle=beam',
  kitty: 'cursor_shape beam\nenable_audio_bell no',
  waybar: '"custom/power": { "format": "power", "on-click": "wlogout" }',
  waybarcss: '#custom-power { color: #ad401f; }',
  polybar: '[module/hello]\ntype = custom/text\ncontent = hello',
};

function exportPanel() {
  const panel = el('div');
  const target = state.target;
  const output = el('textarea', { id: 'o', readOnly: true, spellcheck: false });

  // Switching the file redraws the panel so the additions field shows that file's text
  const fileSelect = selectField(state, 'target', 'File',
                                 Object.entries(TARGETS).map(([id, [label, file]]) => [id, `${label} — ${file}`]),
                                 () => {
                                   showPanel();
                                   saveState();
                                 });

  // --- Own additions ---
  const additionsNote = target === 'waybar'
  ? 'Add JSON entries without the outer braces. They are merged into the config and override generated entries with the same name.'
  : 'Anything you type here is added to the end of this file as-is.';
  const additions = el('textarea', {
    rows: 6,
    value: state.additions[target] || '',
    placeholder: ADDITION_HINTS[target],
    spellcheck: false,
  });
  const additionsMessage = el('p', { className: 'note' }, additionsError(target));
  additions.oninput = () => {
    state.additions[target] = additions.value;
    additionsMessage.textContent = additionsError(target);
    refreshOutput();
    saveState();
  };
  const additionsBox = el('details', { open: true },
                          el('summary', {}, 'Your own additions'),
                          el('p', { className: 'note' }, additionsNote),
                          additions,
                          additionsMessage,
  );
  if (isBarTarget(target) && !state.bar.enabled) {
    additionsBox.append(el('p', { className: 'note' }, 'The bar is disabled, so additions for this file are ignored.'));
  }

  // --- Copy / download / import ---
  const copy = el('button', { className: 'btn', type: 'button', textContent: 'Copy' });
  copy.onclick = () => {
    navigator.clipboard.writeText(output.value).then(() => {
      copy.textContent = 'Copied';
      setTimeout(() => { copy.textContent = 'Copy'; }, 1400);
    });
  };

  const download = el('button', { className: 'btn g', type: 'button', textContent: 'Download' });
  download.onclick = () => {
    const link = el('a', {
      href: URL.createObjectURL(new Blob([output.value])),
                    download: TARGETS[state.target][1],
    });
    link.click();
  };

  const fileInput = el('input', { type: 'file', hidden: true });
  const importButton = el('button', { className: 'btn g', type: 'button', textContent: 'Import config' });
  const message = el('p', { className: 'note' }, 'Import detects the format automatically: MangoWM, Alacritty, foot or kitty.');
  importButton.onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const name = importConfig(await file.text());
    message.textContent = `Imported: ${name}.`;
    update();
  };

  panel.append(
    fileSelect,
    el('div', { className: 'row' }, copy, download, importButton, fileInput),
               message,
               additionsBox,
               output,
  );
  setTimeout(refreshOutput); // wait until the textarea is in the page
  return panel;
}

const TABS = [
  ['mango', 'Main', mangoPanel],
  ['binds', 'Binds', bindsPanel],
  ['term', 'Terminal', terminalPanel],
  ['bar', 'Bar', barPanel],
  ['out', 'Export', exportPanel],
];
let activeTab = 'mango';

    /** Redraw the tab bar and the active panel. */
    function showPanel() {
      const tabBar = $('#tabs');
      tabBar.innerHTML = '';
      TABS.forEach(([id, label]) => {
        const button = el('button', { type: 'button', role: 'tab', textContent: label });
        button.setAttribute('aria-selected', id === activeTab);
        button.onclick = () => {
          activeTab = id;
          showPanel();
        };
        tabBar.append(button);
      });

      const pane = $('#pane');
      pane.innerHTML = '';
      pane.append(TABS.find(([id]) => id === activeTab)[2]());
    }


    /* ---------- 12. Init ---------- */

    showPanel();
    update();
