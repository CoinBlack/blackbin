(function () {
  /*
 A JavaScript implementation of the SHA family of hashes, as defined in FIPS
 PUB 180-2 as well as the corresponding HMAC implementation as defined in
 FIPS PUB 198a

 Copyright Brian Turek 2008-2012
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnson
*/
  function n(a) {
    throw a;
  }
  var q = null;
  function s(a, b) {
    this.a = a;
    this.b = b;
  }
  function u(a, b) {
    var d = [],
      h = (1 << b) - 1,
      f = a.length * b,
      g;
    for (g = 0; g < f; g += b)
      d[g >>> 5] |= (a.charCodeAt(g / b) & h) << (32 - b - (g % 32));
    return { value: d, binLen: f };
  }
  function x(a) {
    var b = [],
      d = a.length,
      h,
      f;
    0 !== d % 2 && n("String of HEX type must be in byte increments");
    for (h = 0; h < d; h += 2)
      (f = parseInt(a.substr(h, 2), 16)),
        isNaN(f) && n("String of HEX type contains invalid characters"),
        (b[h >>> 3] |= f << (24 - 4 * (h % 8)));
    return { value: b, binLen: 4 * d };
  }
  function B(a) {
    var b = [],
      d = 0,
      h,
      f,
      g,
      k,
      m;
    -1 === a.search(/^[a-zA-Z0-9=+\/]+$/) &&
      n("Invalid character in base-64 string");
    h = a.indexOf("=");
    a = a.replace(/\=/g, "");
    -1 !== h && h < a.length && n("Invalid '=' found in base-64 string");
    for (f = 0; f < a.length; f += 4) {
      m = a.substr(f, 4);
      for (g = k = 0; g < m.length; g += 1)
        (h =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(
            m[g]
          )),
          (k |= h << (18 - 6 * g));
      for (g = 0; g < m.length - 1; g += 1)
        (b[d >> 2] |= ((k >>> (16 - 8 * g)) & 255) << (24 - 8 * (d % 4))),
          (d += 1);
    }
    return { value: b, binLen: 8 * d };
  }
  function E(a, b) {
    var d = "",
      h = 4 * a.length,
      f,
      g;
    for (f = 0; f < h; f += 1)
      (g = a[f >>> 2] >>> (8 * (3 - (f % 4)))),
        (d +=
          "0123456789abcdef".charAt((g >>> 4) & 15) +
          "0123456789abcdef".charAt(g & 15));
    return b.outputUpper ? d.toUpperCase() : d;
  }
  function F(a, b) {
    var d = "",
      h = 4 * a.length,
      f,
      g,
      k;
    for (f = 0; f < h; f += 3) {
      k =
        (((a[f >>> 2] >>> (8 * (3 - (f % 4)))) & 255) << 16) |
        (((a[(f + 1) >>> 2] >>> (8 * (3 - ((f + 1) % 4)))) & 255) << 8) |
        ((a[(f + 2) >>> 2] >>> (8 * (3 - ((f + 2) % 4)))) & 255);
      for (g = 0; 4 > g; g += 1)
        d =
          8 * f + 6 * g <= 32 * a.length
            ? d +
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(
                (k >>> (6 * (3 - g))) & 63
              )
            : d + b.b64Pad;
    }
    return d;
  }
  function G(a) {
    var b = { outputUpper: !1, b64Pad: "=" };
    try {
      a.hasOwnProperty("outputUpper") && (b.outputUpper = a.outputUpper),
        a.hasOwnProperty("b64Pad") && (b.b64Pad = a.b64Pad);
    } catch (d) {}
    "boolean" !== typeof b.outputUpper &&
      n("Invalid outputUpper formatting option");
    "string" !== typeof b.b64Pad && n("Invalid b64Pad formatting option");
    return b;
  }
  function H(a, b) {
    var d = q,
      d = new s(a.a, a.b);
    return (d =
      32 >= b
        ? new s(
            (d.a >>> b) | ((d.b << (32 - b)) & 4294967295),
            (d.b >>> b) | ((d.a << (32 - b)) & 4294967295)
          )
        : new s(
            (d.b >>> (b - 32)) | ((d.a << (64 - b)) & 4294967295),
            (d.a >>> (b - 32)) | ((d.b << (64 - b)) & 4294967295)
          ));
  }
  function I(a, b) {
    var d = q;
    return (d =
      32 >= b
        ? new s(a.a >>> b, (a.b >>> b) | ((a.a << (32 - b)) & 4294967295))
        : new s(0, a.a >>> (b - 32)));
  }
  function J(a, b, d) {
    return new s((a.a & b.a) ^ (~a.a & d.a), (a.b & b.b) ^ (~a.b & d.b));
  }
  function U(a, b, d) {
    return new s(
      (a.a & b.a) ^ (a.a & d.a) ^ (b.a & d.a),
      (a.b & b.b) ^ (a.b & d.b) ^ (b.b & d.b)
    );
  }
  function V(a) {
    var b = H(a, 28),
      d = H(a, 34);
    a = H(a, 39);
    return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b);
  }
  function W(a) {
    var b = H(a, 14),
      d = H(a, 18);
    a = H(a, 41);
    return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b);
  }
  function X(a) {
    var b = H(a, 1),
      d = H(a, 8);
    a = I(a, 7);
    return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b);
  }
  function Y(a) {
    var b = H(a, 19),
      d = H(a, 61);
    a = I(a, 6);
    return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b);
  }
  function Z(a, b) {
    var d, h, f;
    d = (a.b & 65535) + (b.b & 65535);
    h = (a.b >>> 16) + (b.b >>> 16) + (d >>> 16);
    f = ((h & 65535) << 16) | (d & 65535);
    d = (a.a & 65535) + (b.a & 65535) + (h >>> 16);
    h = (a.a >>> 16) + (b.a >>> 16) + (d >>> 16);
    return new s(((h & 65535) << 16) | (d & 65535), f);
  }
  function aa(a, b, d, h) {
    var f, g, k;
    f = (a.b & 65535) + (b.b & 65535) + (d.b & 65535) + (h.b & 65535);
    g = (a.b >>> 16) + (b.b >>> 16) + (d.b >>> 16) + (h.b >>> 16) + (f >>> 16);
    k = ((g & 65535) << 16) | (f & 65535);
    f =
      (a.a & 65535) +
      (b.a & 65535) +
      (d.a & 65535) +
      (h.a & 65535) +
      (g >>> 16);
    g = (a.a >>> 16) + (b.a >>> 16) + (d.a >>> 16) + (h.a >>> 16) + (f >>> 16);
    return new s(((g & 65535) << 16) | (f & 65535), k);
  }
  function ba(a, b, d, h, f) {
    var g, k, m;
    g =
      (a.b & 65535) +
      (b.b & 65535) +
      (d.b & 65535) +
      (h.b & 65535) +
      (f.b & 65535);
    k =
      (a.b >>> 16) +
      (b.b >>> 16) +
      (d.b >>> 16) +
      (h.b >>> 16) +
      (f.b >>> 16) +
      (g >>> 16);
    m = ((k & 65535) << 16) | (g & 65535);
    g =
      (a.a & 65535) +
      (b.a & 65535) +
      (d.a & 65535) +
      (h.a & 65535) +
      (f.a & 65535) +
      (k >>> 16);
    k =
      (a.a >>> 16) +
      (b.a >>> 16) +
      (d.a >>> 16) +
      (h.a >>> 16) +
      (f.a >>> 16) +
      (g >>> 16);
    return new s(((k & 65535) << 16) | (g & 65535), m);
  }
  function $(a, b, d) {
    var h,
      f,
      g,
      k,
      m,
      j,
      A,
      C,
      K,
      e,
      L,
      v,
      l,
      M,
      t,
      p,
      y,
      z,
      r,
      N,
      O,
      P,
      Q,
      R,
      c,
      S,
      w = [],
      T,
      D;
    "SHA-384" === d || "SHA-512" === d
      ? ((L = 80),
        (h = (((b + 128) >>> 10) << 5) + 31),
        (M = 32),
        (t = 2),
        (c = s),
        (p = Z),
        (y = aa),
        (z = ba),
        (r = X),
        (N = Y),
        (O = V),
        (P = W),
        (R = U),
        (Q = J),
        (S = [
          new c(1116352408, 3609767458),
          new c(1899447441, 602891725),
          new c(3049323471, 3964484399),
          new c(3921009573, 2173295548),
          new c(961987163, 4081628472),
          new c(1508970993, 3053834265),
          new c(2453635748, 2937671579),
          new c(2870763221, 3664609560),
          new c(3624381080, 2734883394),
          new c(310598401, 1164996542),
          new c(607225278, 1323610764),
          new c(1426881987, 3590304994),
          new c(1925078388, 4068182383),
          new c(2162078206, 991336113),
          new c(2614888103, 633803317),
          new c(3248222580, 3479774868),
          new c(3835390401, 2666613458),
          new c(4022224774, 944711139),
          new c(264347078, 2341262773),
          new c(604807628, 2007800933),
          new c(770255983, 1495990901),
          new c(1249150122, 1856431235),
          new c(1555081692, 3175218132),
          new c(1996064986, 2198950837),
          new c(2554220882, 3999719339),
          new c(2821834349, 766784016),
          new c(2952996808, 2566594879),
          new c(3210313671, 3203337956),
          new c(3336571891, 1034457026),
          new c(3584528711, 2466948901),
          new c(113926993, 3758326383),
          new c(338241895, 168717936),
          new c(666307205, 1188179964),
          new c(773529912, 1546045734),
          new c(1294757372, 1522805485),
          new c(1396182291, 2643833823),
          new c(1695183700, 2343527390),
          new c(1986661051, 1014477480),
          new c(2177026350, 1206759142),
          new c(2456956037, 344077627),
          new c(2730485921, 1290863460),
          new c(2820302411, 3158454273),
          new c(3259730800, 3505952657),
          new c(3345764771, 106217008),
          new c(3516065817, 3606008344),
          new c(3600352804, 1432725776),
          new c(4094571909, 1467031594),
          new c(275423344, 851169720),
          new c(430227734, 3100823752),
          new c(506948616, 1363258195),
          new c(659060556, 3750685593),
          new c(883997877, 3785050280),
          new c(958139571, 3318307427),
          new c(1322822218, 3812723403),
          new c(1537002063, 2003034995),
          new c(1747873779, 3602036899),
          new c(1955562222, 1575990012),
          new c(2024104815, 1125592928),
          new c(2227730452, 2716904306),
          new c(2361852424, 442776044),
          new c(2428436474, 593698344),
          new c(2756734187, 3733110249),
          new c(3204031479, 2999351573),
          new c(3329325298, 3815920427),
          new c(3391569614, 3928383900),
          new c(3515267271, 566280711),
          new c(3940187606, 3454069534),
          new c(4118630271, 4000239992),
          new c(116418474, 1914138554),
          new c(174292421, 2731055270),
          new c(289380356, 3203993006),
          new c(460393269, 320620315),
          new c(685471733, 587496836),
          new c(852142971, 1086792851),
          new c(1017036298, 365543100),
          new c(1126000580, 2618297676),
          new c(1288033470, 3409855158),
          new c(1501505948, 4234509866),
          new c(1607167915, 987167468),
          new c(1816402316, 1246189591),
        ]),
        (e =
          "SHA-384" === d
            ? [
                new c(3418070365, 3238371032),
                new c(1654270250, 914150663),
                new c(2438529370, 812702999),
                new c(355462360, 4144912697),
                new c(1731405415, 4290775857),
                new c(41048885895, 1750603025),
                new c(3675008525, 1694076839),
                new c(1203062813, 3204075428),
              ]
            : [
                new c(1779033703, 4089235720),
                new c(3144134277, 2227873595),
                new c(1013904242, 4271175723),
                new c(2773480762, 1595750129),
                new c(1359893119, 2917565137),
                new c(2600822924, 725511199),
                new c(528734635, 4215389547),
                new c(1541459225, 327033209),
              ]))
      : n("Unexpected error in SHA-2 implementation");
    a[b >>> 5] |= 128 << (24 - (b % 32));
    a[h] = b;
    T = a.length;
    for (v = 0; v < T; v += M) {
      b = e[0];
      h = e[1];
      f = e[2];
      g = e[3];
      k = e[4];
      m = e[5];
      j = e[6];
      A = e[7];
      for (l = 0; l < L; l += 1)
        (w[l] =
          16 > l
            ? new c(a[l * t + v], a[l * t + v + 1])
            : y(N(w[l - 2]), w[l - 7], r(w[l - 15]), w[l - 16])),
          (C = z(A, P(k), Q(k, m, j), S[l], w[l])),
          (K = p(O(b), R(b, h, f))),
          (A = j),
          (j = m),
          (m = k),
          (k = p(g, C)),
          (g = f),
          (f = h),
          (h = b),
          (b = p(C, K));
      e[0] = p(b, e[0]);
      e[1] = p(h, e[1]);
      e[2] = p(f, e[2]);
      e[3] = p(g, e[3]);
      e[4] = p(k, e[4]);
      e[5] = p(m, e[5]);
      e[6] = p(j, e[6]);
      e[7] = p(A, e[7]);
    }
    "SHA-384" === d
      ? (D = [
          e[0].a,
          e[0].b,
          e[1].a,
          e[1].b,
          e[2].a,
          e[2].b,
          e[3].a,
          e[3].b,
          e[4].a,
          e[4].b,
          e[5].a,
          e[5].b,
        ])
      : "SHA-512" === d
      ? (D = [
          e[0].a,
          e[0].b,
          e[1].a,
          e[1].b,
          e[2].a,
          e[2].b,
          e[3].a,
          e[3].b,
          e[4].a,
          e[4].b,
          e[5].a,
          e[5].b,
          e[6].a,
          e[6].b,
          e[7].a,
          e[7].b,
        ])
      : n("Unexpected error in SHA-2 implementation");
    return D;
  }
  window.jsSHA = function (a, b, d) {
    var h = q,
      f = q,
      g = 0,
      k = [0],
      m = 0,
      j = q,
      m = "undefined" !== typeof d ? d : 8;
    8 === m || 16 === m || n("charSize must be 8 or 16");
    "HEX" === b
      ? (0 !== a.length % 2 &&
          n("srcString of HEX type must be in byte increments"),
        (j = x(a)),
        (g = j.binLen),
        (k = j.value))
      : "ASCII" === b || "TEXT" === b
      ? ((j = u(a, m)), (g = j.binLen), (k = j.value))
      : "B64" === b
      ? ((j = B(a)), (g = j.binLen), (k = j.value))
      : n("inputFormat must be HEX, TEXT, ASCII, or B64");
    this.getHash = function (a, b, d) {
      var e = q,
        m = k.slice(),
        j = "";
      switch (b) {
        case "HEX":
          e = E;
          break;
        case "B64":
          e = F;
          break;
        default:
          n("format must be HEX or B64");
      }
      "SHA-384" === a
        ? (q === h && (h = $(m, g, a)), (j = e(h, G(d))))
        : "SHA-512" === a
        ? (q === f && (f = $(m, g, a)), (j = e(f, G(d))))
        : n("Chosen SHA variant is not supported");
      return j;
    };
    this.getHMAC = function (a, b, d, e, f) {
      var h,
        l,
        j,
        t,
        p,
        y = [],
        z = [],
        r = q;
      switch (e) {
        case "HEX":
          h = E;
          break;
        case "B64":
          h = F;
          break;
        default:
          n("outputFormat must be HEX or B64");
      }
      "SHA-384" === d
        ? ((j = 128), (p = 384))
        : "SHA-512" === d
        ? ((j = 128), (p = 512))
        : n("Chosen SHA variant is not supported");
      "HEX" === b
        ? ((r = x(a)), (t = r.binLen), (l = r.value))
        : "ASCII" === b || "TEXT" === b
        ? ((r = u(a, m)), (t = r.binLen), (l = r.value))
        : "B64" === b
        ? ((r = B(a)), (t = r.binLen), (l = r.value))
        : n("inputFormat must be HEX, TEXT, ASCII, or B64");
      a = 8 * j;
      b = j / 4 - 1;
      j < t / 8
        ? ((l = $(l, t, d)), (l[b] &= 4294967040))
        : j > t / 8 && (l[b] &= 4294967040);
      for (j = 0; j <= b; j += 1)
        (y[j] = l[j] ^ 909522486), (z[j] = l[j] ^ 1549556828);
      d = $(z.concat($(y.concat(k), a + g, d)), a + p, d);
      return h(d, G(f));
    };
  };
})();
