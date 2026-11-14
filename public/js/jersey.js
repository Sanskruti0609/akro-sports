// Original SVG jersey / jacket / kit generator (placeholder product imagery).
// Usage: Jersey.svg(product, { hanger: true, number: '10', name: 'AKRO' })
window.Jersey = (() => {
  let uid = 0;

  const BODY_SHORT = 'M118 22 L62 42 L12 112 L52 138 L76 108 L76 322 Q150 332 224 322 L224 108 L248 138 L288 112 L238 42 L182 22 Q150 58 118 22 Z';
  const BODY_LONG  = 'M118 22 L62 42 L22 272 L64 280 L76 140 L76 322 Q150 332 224 322 L224 140 L236 280 L278 272 L238 42 L182 22 Q150 46 118 22 Z';
  const SLEEVES_SHORT = ['M62 42 L12 112 L52 138 L76 108 L76 60 Z', 'M238 42 L288 112 L248 138 L224 108 L224 60 Z'];
  const SLEEVES_LONG  = ['M62 42 L22 272 L64 280 L76 140 L76 60 Z', 'M238 42 L278 272 L236 280 L224 140 L224 60 Z'];

  function lum(hex) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function pattern(kind, d, id) {
    const a = d.accent;
    switch (kind) {
      case 'sash': return `<path d="M64 26 L136 26 L252 336 L180 336 Z" fill="${a}"/><path d="M148 26 L158 26 L270 336 L260 336 Z" fill="${d.trim}" opacity=".9"/>`;
      case 'chevron': return [120, 158, 196].map((y, i) => `<path d="M76 ${y} L150 ${y + 44} L224 ${y} L224 ${y + 16} L150 ${y + 60} L76 ${y + 16} Z" fill="${a}" opacity="${1 - i * .22}"/>`).join('');
      case 'stripes': return Array.from({ length: 6 }, (_, i) => `<rect x="${76 + i * 26}" y="20" width="${i % 2 ? 0 : 14}" height="320" fill="${a}" opacity=".95"/>`).join('') + `<rect x="${76 + 5 * 26 - 12}" y="20" width="0" height="0"/>`;
      case 'pinstripe': return Array.from({ length: 13 }, (_, i) => `<rect x="${78 + i * 12}" y="20" width="2.4" height="320" fill="${a}" opacity=".85"/>`).join('');
      case 'hoops': return [92, 140, 188, 236, 284].map(y => `<rect x="0" y="${y}" width="300" height="20" fill="${a}"/>`).join('');
      case 'gradient': return `<rect x="0" y="0" width="300" height="340" fill="url(#g${id})"/>`;
      case 'diagonal': return `<g opacity=".95"><path d="M60 330 L260 150 L260 190 L100 340 Z" fill="${a}"/><path d="M40 270 L260 70 L260 98 L70 290 Z" fill="${a}" opacity=".55"/></g>`;
      case 'halves': return `<rect x="150" y="0" width="150" height="340" fill="${a}"/>`;
      default: return '';
    }
  }

  function jerseyGroup(p, o, id, long) {
    const d = p.design, body = long ? BODY_LONG : BODY_SHORT, sleeves = long ? SLEEVES_LONG : SLEEVES_SHORT;
    const dark = lum(d.body) < 0.45;
    const sleeveFill = ['gradient'].includes(d.pattern) ? d.accent : (d.trim === d.body ? d.accent : d.trim);
    const collarFill = d.trim === d.body ? d.accent : d.trim;
    const text = lum(d.body) > 0.6 ? '#111' : '#fff';
    const back = !!o.back;
    const nameTxt = (o.name || '').toString().replace(/[<>&"]/g, '');
    const nameEl = back && nameTxt ? `<text x="150" y="${o.number ? 150 : 200}" text-anchor="middle" font-family="Barlow Condensed,Impact,sans-serif" font-weight="800" font-size="${nameTxt.length > 8 ? 24 : 30}" letter-spacing="3" fill="${text}" opacity=".95">${nameTxt}</text>` : '';
    const wordmark = long || back ? '' : `<text x="150" y="${o.number ? 126 : 150}" text-anchor="middle" font-family="Barlow Condensed,Impact,sans-serif" font-weight="900" font-style="italic" font-size="30" letter-spacing="2" fill="${text}" opacity=".92">AKRO</text>`;
    const crest = `<g transform="translate(106 86)"><path d="M0 0 h26 v22 q0 14 -13 20 q-13 -6 -13 -20z" fill="${d.accent === d.body ? d.trim : d.accent}" stroke="${text}" stroke-width="2" stroke-opacity=".6"/><text x="13" y="26" text-anchor="middle" font-family="Barlow Condensed,Impact,sans-serif" font-weight="900" font-style="italic" font-size="20" fill="${lum(d.accent) > .6 ? '#111' : '#fff'}">A</text></g>`;
    const num = o.number ? `<text x="150" y="238" text-anchor="middle" font-family="Barlow Condensed,Impact,sans-serif" font-weight="900" font-size="88" fill="${text}" opacity=".95">${o.number}</text>` : '';
    const zip = long ? `<line x1="150" y1="46" x2="150" y2="326" stroke="${d.trim}" stroke-width="3"/><rect x="144" y="150" width="12" height="20" rx="3" fill="${d.trim}"/><path d="M96 250 h28 M176 250 h28" stroke="${d.trim}" stroke-width="3" stroke-linecap="round" opacity=".8"/>` : '';
    return `
    <defs>
      <clipPath id="c${id}"><path d="${body}"/></clipPath>
      <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d.body}"/><stop offset="1" stop-color="${d.accent}"/></linearGradient>
      <linearGradient id="s${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".28" stop-color="#fff" stop-opacity=".07"/><stop offset=".6" stop-color="#000" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
    </defs>
    <g clip-path="url(#c${id})">
      <rect width="300" height="340" fill="${d.body}"/>
      ${pattern(d.pattern, d, id)}
      ${sleeves.map(s => `<path d="${s}" fill="${sleeveFill}"/>`).join('')}
      <rect width="300" height="340" fill="url(#s${id})"/>
      <path d="M100 120 Q150 150 200 120 M92 210 Q150 232 208 210" stroke="#000" stroke-opacity=".07" stroke-width="10" fill="none"/>
      ${zip}${long || back ? '' : crest}${wordmark}${nameEl}${num}
    </g>
    <path d="${body}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/>
    <path d="M118 22 Q150 ${long ? 46 : 58} 182 22" fill="none" stroke="${collarFill}" stroke-width="9" stroke-linecap="round"/>
    <path d="M118 22 Q150 ${long ? 46 : 58} 182 22" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.5" transform="translate(0 5)"/>
    ${long ? `<path d="M22 272 L64 280 M278 272 L236 280" stroke="${collarFill}" stroke-width="9" stroke-linecap="round"/>` : `<path d="M12 112 L52 138 M288 112 L248 138" stroke="${collarFill}" stroke-width="8" stroke-linecap="round"/>`}
    <path d="M76 322 Q150 332 224 322" fill="none" stroke="${collarFill}" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;
  }

  function shorts(p) {
    const d = p.design, c = d.body, t = d.accent === d.body ? d.trim : d.accent;
    return `<path d="M84 342 L216 342 L230 448 L160 448 L150 392 L140 448 L70 448 Z" fill="${c}" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/>
      <path d="M84 342 L216 342" stroke="${t}" stroke-width="8" stroke-linecap="round"/>
      <path d="M222 360 L230 448 M78 360 L70 448" stroke="${t}" stroke-width="5" opacity=".9"/>
      <rect x="0" y="0" width="0" height="0"/>`;
  }

  function svg(p, o = {}) {
    const id = ++uid, long = p.type === 'jacket', kit = p.type === 'kit';
    const hanger = o.hanger && !kit;
    const vb = hanger ? '0 -52 300 396' : kit ? '0 0 300 452' : '0 0 300 344';
    const hang = hanger ? `<g fill="none" stroke="#b9bcc2" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M150 -2 L150 -18 Q150 -34 166 -34 Q180 -34 180 -22"/><path d="M150 -2 L48 40 M150 -2 L252 40"/></g>` : '';
    return `<svg class="jersey" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name} ${p.sub || ''}">${hang}${jerseyGroup(p, o, id, long)}${kit ? shorts(p) : ''}</svg>`;
  }

  return { svg };
})();
