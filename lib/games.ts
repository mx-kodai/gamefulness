export type GameColor = "red" | "yellow" | "blue" | "green";
export type GameStatus = "playable" | "soon";

export type GameMeta = {
  slug: string;
  title: string;
  kana: string;
  tagline: string;
  color: GameColor;
  status: GameStatus;
  concept: string;
  howTo: string[];
  wellness: string;
  duration: string;
};

export const GAMES: GameMeta[] = [
  {
    slug: "tobikko",
    title: "とびっこ",
    kana: "TOBIKKO",
    tagline: "タップでジャンプ。障害物をよけて走り続けよう。",
    color: "red",
    status: "playable",
    concept:
      "画面をタップすると、ちいさな相棒がぴょんっと飛ぶ。来る岩をよけて、どこまでも走ろう。説明書はいらない。走る、跳ぶ、笑う。ゲームの基本を一本に凝縮した走り物。",
    howTo: [
      "画面かスペースキーで、ジャンプ",
      "岩にぶつかるまで、走り続けます",
      "走るほど、スピードが上がります",
    ],
    wellness: "反射神経・タイミング認知・達成感を、1タップで。",
    duration: "1プレイ 30秒〜3分",
  },
  {
    slug: "tsurikko",
    title: "つりっこ",
    kana: "TSURIKKO",
    tagline: "アタリのタイミングでぐっと引こう。",
    color: "blue",
    status: "playable",
    concept:
      "水面に糸をたらし、魚が食いついた瞬間にタップ。早すぎても遅すぎても逃げる。魚影が大きいほど大物。60秒でどれだけ釣れるか。",
    howTo: [
      "「！」が出た瞬間にタップ",
      "大物ほど引きが強く、高得点",
      "早まると糸を切られます",
    ],
    wellness: "待つこと・集中・タイミング。反射ではなく、呼吸に合わせる釣り。",
    duration: "1プレイ 1分",
  },
  {
    slug: "manekko",
    title: "まねっこ",
    kana: "MANEKKO",
    tagline: "光の順番を、指でなぞる脳の体操。",
    color: "red",
    status: "playable",
    concept:
      "4色が順に光る。その通りに触るだけ。だんだん長くなる光の列に合わせて、記憶が少しずつ伸びていくのを感じてほしい。勝敗より、そのあそびの時間そのものを大切に。",
    howTo: [
      "中央の4色パネルが、一つずつ順に光ります",
      "光った順と同じ色をタップしてください",
      "だんだん長くなります。ゆっくりで大丈夫",
    ],
    wellness: "短期記憶・注意集中・手と目の連携を、刺激ではなく呼吸のように。",
    duration: "1プレイ 1〜5分",
  },
  {
    slug: "kazerin",
    title: "かぜりん",
    kana: "KAZERIN",
    tagline: "光った風鈴を、やさしく鳴らそう。",
    color: "blue",
    status: "playable",
    concept:
      "夏の縁側で風鈴を揺らすような、ゆるやかな一本道のゲーム。光った風鈴を触るだけ。どの風鈴にも、それぞれの音色がある。",
    howTo: [
      "4つの風鈴のどれかが、ふわっと光ります",
      "光った風鈴をタップすると、綺麗な音が鳴ります",
      "タイミングは急がなくてOK",
    ],
    wellness: "聴覚刺激・反応のやさしい促し・手指の細かなコントロール。",
    duration: "1プレイ 1〜3分",
  },
  {
    slug: "sorami",
    title: "そら見る",
    kana: "SORAMI",
    tagline: "空をよぎるものを、タップして集める。",
    color: "green",
    status: "playable",
    concept:
      "朝から夕方へ変わる空を、鳥が、ふうせんが、流れ星が通りすぎる。見つけたらタップ。40秒のタイムアタック。焦らなくていい、けれど、ちょっとだけ夢中になる。",
    howTo: [
      "空を流れる鳥やふうせん、星をタップ",
      "大物ほど高得点（流れ星は+5点）",
      "40秒でどれだけ集められるか",
    ],
    wellness: "視覚の探索・動体視力・反応のやさしい練習。",
    duration: "1プレイ 40秒",
  },
  {
    slug: "iroshiri",
    title: "いろしりとり",
    kana: "IRO-SHIRITORI",
    tagline: "色と言葉でつなぐ。",
    color: "yellow",
    status: "soon",
    concept:
      "「あか → かば → ばなな」と、言葉をつなぎながら、その言葉の色で画面がぽっと染まる。色彩と言語の記憶を、やさしく行き来するあそび。",
    howTo: ["画面の言葉から1つを選びます", "次の人は、最後の文字から始まる言葉を選びます", "3人までで回せます"],
    wellness: "言語流暢性・色彩認知・社会的交流のきっかけ。",
    duration: "1プレイ 3〜5分",
  },
  {
    slug: "katachi",
    title: "かたち合わせ",
    kana: "KATACHI",
    tagline: "線をなぞってかたちを作る。",
    color: "red",
    status: "soon",
    concept:
      "画面に薄く浮かぶ形を、指でそっとなぞる。丸、三角、四角。単純な形ほど、触れる楽しみが際立つ。",
    howTo: ["薄く光るガイド線を指でなぞります", "最後まで途切れずになぞれたらクリア", "難易度は自動で調整"],
    wellness: "手指制御・視覚空間認識・集中の持続。",
    duration: "1プレイ 1〜3分",
  },
  {
    slug: "tsukihi",
    title: "月のリズム",
    kana: "TSUKI",
    tagline: "月の満ち欠けに合わせてタップ。",
    color: "blue",
    status: "soon",
    concept:
      "新月から満月、また新月へ。満ちていく光、欠けていく光のリズムに合わせて、やさしく指を置く。呼吸誘導系のもっとも静かな一本。",
    howTo: ["満ちる光に合わせて息を吸います", "欠ける光に合わせて息を吐きます", "リズムに合わせてタップ"],
    wellness: "呼吸リズムの整え・自律神経の鎮静・睡眠前の利用に向く。",
    duration: "1プレイ 2〜5分",
  },
  {
    slug: "kotoba",
    title: "ことばの庭",
    kana: "KOTOBA",
    tagline: "やさしい言葉を集めよう。",
    color: "yellow",
    status: "soon",
    concept:
      "「ありがとう」「おかえり」「だいじょうぶ」。画面の庭に、集めた言葉がちいさな花として咲いていく。",
    howTo: ["3つの言葉から、今日の気持ちに近いものを選びます", "庭に花が咲きます", "続けるほど庭が豊かに"],
    wellness: "肯定的感情の喚起・語彙の想起・毎日の小さな記録に。",
    duration: "1プレイ 1〜2分",
  },
  {
    slug: "nekonade",
    title: "ねこなで",
    kana: "NEKONADE",
    tagline: "のどを鳴らすまで、ゆっくり撫でよう。",
    color: "green",
    status: "soon",
    concept:
      "画面のねこを、指でやさしく撫でる。強すぎると逃げる。やさしく、ゆっくり。目を細めて、ごろごろ鳴きはじめたらクリア。",
    howTo: ["画面のねこを指で撫でます", "強すぎず、一定の速さで", "ごろごろ言いはじめたら成功"],
    wellness: "触覚的リラックス・ペースを緩める練習・情緒安定。",
    duration: "1プレイ 1〜3分",
  },
  {
    slug: "egao",
    title: "えがお体操",
    kana: "EGAO",
    tagline: "指先でゆるやかに動かす。",
    color: "red",
    status: "soon",
    concept:
      "画面のまるい顔を、指でやさしく上げると笑顔になる。一緒に、体も少しだけ前を向く。",
    howTo: ["口角を指でやさしく上げます", "目尻もすこし持ち上げます", "数秒キープすると花火が上がります"],
    wellness: "表情筋の活性・気分の向上・声かけのきっかけに。",
    duration: "1プレイ 1〜2分",
  },
  {
    slug: "origami",
    title: "ぱたぱた折り紙",
    kana: "ORIGAMI",
    tagline: "折って広げて、形になる。",
    color: "blue",
    status: "soon",
    concept:
      "折り目に沿って紙をたたむ、ひたすら単純なあそび。完成した形はたまにちょっと可笑しい。",
    howTo: ["薄く見える折り線をタップ", "順に折っていきます", "最後にぱっ、と開くと何かが見えます"],
    wellness: "空間認知・順序の記憶・手指の細やかさ。",
    duration: "1プレイ 2〜4分",
  },
  {
    slug: "yubiuta",
    title: "ゆびうた",
    kana: "YUBIUTA",
    tagline: "リズムに合わせて4色を叩く。",
    color: "yellow",
    status: "soon",
    concept:
      "童謡のリズムに合わせて、4色をトントンと叩く。むずかしくはない。当たっても外しても、歌はつづく。",
    howTo: ["流れる歌のリズムに合わせます", "色が光った瞬間を叩きます", "スコアより、歌うこと"],
    wellness: "リズム感・聴覚処理・発声の促し。",
    duration: "1プレイ 2〜3分",
  },
  {
    slug: "maigo",
    title: "おかえり迷路",
    kana: "MAIGO",
    tagline: "道をゆっくり見つけよう。",
    color: "green",
    status: "soon",
    concept:
      "小さなねこを家まで連れて帰る、時間無制限の静かな迷路。焦らせない、道は逃げない。",
    howTo: ["指でねこを家までなぞります", "道を外れたら、またゆっくりで大丈夫", "所要時間は気にしないで"],
    wellness: "視覚空間認識・運動計画・持続的な注意。",
    duration: "1プレイ 3〜8分",
  },
];

export const GAME_BY_SLUG: Record<string, GameMeta> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g]),
);

export const COLOR_HEX: Record<GameColor, string> = {
  red: "#E23D3D",
  yellow: "#F4B533",
  blue: "#2F7FE0",
  green: "#2FA66E",
};
