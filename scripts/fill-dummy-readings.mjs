import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const readingsDir = path.join(__dirname, "..", "src", "data", "readings");

const masterProfile = {
  cassian: {
    tone: "분석형",
    summary: "데이터와 패턴을 기준으로 보면 오늘의 핵심은 **우선순위 재정렬**입니다.",
    work: "지금 필요한 건 속도보다 정확도입니다. 체크리스트를 만든 뒤 실행하면 성과가 깔끔하게 납니다.",
    love: "감정 표현 전에 사실 확인부터 해보세요. 오해를 줄이면 관계의 안정도가 올라갑니다.",
    money: "예산을 수치로 분리해보면 새는 지점이 보입니다. 작은 누수를 막는 것이 먼저입니다.",
    quote: "논리는 감정을 지우는 도구가 아니라, 감정을 지키는 안전장치입니다.",
    keywords: ["분석", "우선순위", "정확도", "구조화"],
  },
  aiden: {
    tone: "상담형",
    summary: "오늘은 나를 다그치기보다 **마음을 달래며 한 걸음** 가는 흐름이 좋습니다.",
    work: "혼자 끌어안지 말고 주변에 도움을 요청해보세요. 대화가 막힌 문제를 쉽게 풉니다.",
    love: "상대의 말 뒤에 숨은 감정을 먼저 들어주세요. 공감이 관계의 온도를 빠르게 회복시킵니다.",
    money: "불안할수록 소비가 커질 수 있어요. 오늘은 안정감을 주는 지출만 남기는 게 좋습니다.",
    quote: "괜찮아지는 속도는 느려도 됩니다. 멈추지 않고 있는 것만으로 충분합니다.",
    keywords: ["공감", "회복", "대화", "안정"],
  },
  morgana: {
    tone: "직설형",
    summary: "돌려 말할 필요 없습니다. 오늘은 **결정하고 바로 움직이는 날**입니다.",
    work: "중요하지 않은 일은 과감히 끊으세요. 핵심 1개만 잡아도 결과가 달라집니다.",
    love: "애매한 신호를 반복하지 마세요. 원하는 바를 명확히 말할수록 관계가 선명해집니다.",
    money: "충동 결제 버튼을 누르기 전에 10분만 멈추세요. 멈춤이 곧 절약입니다.",
    quote: "당신을 지키는 건 완벽한 준비가 아니라, 빠른 결단입니다.",
    keywords: ["결단", "핵심", "속도", "실행력"],
  },
  noa: {
    tone: "구원형",
    summary: "마음의 상처를 다독이면 운도 따라옵니다. 오늘은 **회복이 곧 전진**입니다.",
    work: "지친 상태에서 무리하지 말고 호흡을 조절하세요. 페이스를 회복하면 집중력이 돌아옵니다.",
    love: "서운함을 탓으로 말하지 말고 바람으로 말해보세요. 부드러운 문장이 관계를 살립니다.",
    money: "자책 소비를 줄이고 나를 돌보는 소비만 남겨보세요. 균형이 곧 안정입니다.",
    quote: "당신이 스스로를 용서하는 순간, 멈췄던 흐름도 다시 움직입니다.",
    keywords: ["치유", "회복", "위로", "안정"],
  },
  erebus: {
    tone: "현실형",
    summary: "이상보다 현실 점검이 먼저입니다. 오늘은 **실행 가능한 계획**이 답입니다.",
    work: "일정을 시간 단위로 쪼개세요. 구체화된 계획은 실행 저항을 크게 낮춥니다.",
    love: "약속은 감정보다 행동으로 보여주세요. 작은 실천이 신뢰를 쌓습니다.",
    money: "고정비/변동비를 분리하면 판단이 쉬워집니다. 수치가 기준이 되어야 흔들리지 않습니다.",
    quote: "좋은 선택은 멋져 보이는 선택이 아니라, 지속 가능한 선택입니다.",
    keywords: ["현실", "실행", "관리", "지속성"],
  },
  serina: {
    tone: "행운형",
    summary: "흐름이 열리는 날입니다. 오늘은 **좋은 타이밍을 붙잡는 감각**이 중요합니다.",
    work: "먼저 손을 들고 기회를 잡아보세요. 선제 행동이 기대 이상의 연결을 만듭니다.",
    love: "작은 칭찬과 밝은 제안이 관계를 환하게 엽니다. 가벼운 표현이 큰 변화를 만듭니다.",
    money: "운이 들어와도 관리가 필요합니다. 기분 소비보다 목적 소비를 선택하세요.",
    quote: "행운은 기다리는 사람보다, 먼저 문을 여는 사람에게 오래 머뭅니다.",
    keywords: ["행운", "타이밍", "확장", "기회"],
  },
  nyx: {
    tone: "초월형",
    summary: "겉의 소음보다 내면의 신호를 들을 때입니다. 오늘의 키워드는 **직관의 정렬**입니다.",
    work: "결론을 서두르지 말고 한 박자 내려앉아 보세요. 침묵 속에서 정확한 방향이 떠오릅니다.",
    love: "표면의 말보다 마음의 결을 읽어보세요. 깊은 이해가 관계를 새로운 층위로 이끕니다.",
    money: "불안에서 나온 선택은 피하세요. 마음이 고요할 때 결정한 소비가 오래 갑니다.",
    quote: "답은 멀리 있지 않습니다. 이미 당신 안에서 조용히 빛나고 있습니다.",
    keywords: ["직관", "통찰", "심연", "변화"],
  },
  clotho: {
    tone: "AI형",
    summary: "입력된 정보가 쌓여 결과를 만듭니다. 오늘은 **패턴 최적화**가 핵심입니다.",
    work: "반복 작업을 자동화 관점으로 바라보세요. 구조를 바꾸면 에너지를 크게 절약할 수 있습니다.",
    love: "감정 로그를 정리하듯 대화를 복기해보세요. 반복되는 충돌 패턴이 명확해집니다.",
    money: "지출 데이터를 카테고리화하면 개선 포인트가 선명해집니다. 측정 가능한 변화부터 시작하세요.",
    quote: "미래는 예측이 아니라, 학습된 선택의 누적으로 업데이트됩니다.",
    keywords: ["패턴", "최적화", "학습", "업데이트"],
  },
  pipi: {
    tone: "감성형",
    summary: "작은 감정의 결이 하루를 바꿉니다. 오늘은 **마음을 다정하게 돌보는 날**입니다.",
    work: "성과도 중요하지만 컨디션이 먼저예요. 내 리듬에 맞추면 결과도 부드럽게 따라옵니다.",
    love: "짧은 안부 한마디가 큰 위로가 됩니다. 따뜻한 표현이 관계의 긴장을 풀어줍니다.",
    money: "마음을 달래기 위한 소비는 잠깐만 위로가 됩니다. 오래 가는 만족을 고르세요.",
    quote: "당신의 다정함은 약점이 아니라, 세상을 견디게 하는 힘입니다.",
    keywords: ["감성", "다정함", "공명", "섬세함"],
  },
};

const luckyItems = ["노트", "유리컵", "작은 향수", "무선이어폰", "실버 반지", "따뜻한 차"];
const luckyPlaces = ["창가 자리", "조용한 카페", "집 근처 산책로", "서점", "버스 뒷좌석", "공원 벤치"];
const cautions = [
  "감정적인 즉답은 한 템포 늦추세요.",
  "완벽주의로 시작을 미루지 마세요.",
  "남의 속도에 자신을 맞추지 마세요.",
  "사소한 지출이 누적되지 않게 점검하세요.",
  "중요한 약속은 다시 한 번 확인하세요.",
  "피로를 무시하지 말고 휴식을 확보하세요.",
];

const tarotNames = [
  ["The Fool", "바보"],
  ["The Magician", "마법사"],
  ["The High Priestess", "여교황"],
  ["The Empress", "여황제"],
  ["The Emperor", "황제"],
  ["The Hierophant", "교황"],
  ["The Lovers", "연인"],
  ["The Chariot", "전차"],
  ["Strength", "힘"],
  ["The Hermit", "은둔자"],
  ["Wheel of Fortune", "운명의 수레바퀴"],
  ["Justice", "정의"],
  ["The Hanged Man", "매달린 사람"],
  ["Death", "죽음"],
  ["Temperance", "절제"],
  ["The Devil", "악마"],
  ["The Tower", "탑"],
  ["The Star", "별"],
  ["The Moon", "달"],
  ["The Sun", "태양"],
  ["Judgement", "심판"],
  ["The World", "세계"],
  ["Ace of Wands", "완드 에이스"],
  ["Two of Wands", "완드 2"],
  ["Three of Wands", "완드 3"],
  ["Four of Wands", "완드 4"],
  ["Five of Wands", "완드 5"],
  ["Six of Wands", "완드 6"],
  ["Seven of Wands", "완드 7"],
  ["Eight of Wands", "완드 8"],
  ["Nine of Wands", "완드 9"],
  ["Ten of Wands", "완드 10"],
  ["Page of Wands", "완드 시종"],
  ["Knight of Wands", "완드 기사"],
  ["Queen of Wands", "완드 여왕"],
  ["King of Wands", "완드 왕"],
  ["Ace of Cups", "컵 에이스"],
  ["Two of Cups", "컵 2"],
  ["Three of Cups", "컵 3"],
  ["Four of Cups", "컵 4"],
  ["Five of Cups", "컵 5"],
  ["Six of Cups", "컵 6"],
  ["Seven of Cups", "컵 7"],
  ["Eight of Cups", "컵 8"],
  ["Nine of Cups", "컵 9"],
  ["Ten of Cups", "컵 10"],
  ["Page of Cups", "컵 시종"],
  ["Knight of Cups", "컵 기사"],
  ["Queen of Cups", "컵 여왕"],
  ["King of Cups", "컵 왕"],
  ["Ace of Swords", "소드 에이스"],
  ["Two of Swords", "소드 2"],
  ["Three of Swords", "소드 3"],
  ["Four of Swords", "소드 4"],
  ["Five of Swords", "소드 5"],
  ["Six of Swords", "소드 6"],
  ["Seven of Swords", "소드 7"],
  ["Eight of Swords", "소드 8"],
  ["Nine of Swords", "소드 9"],
  ["Ten of Swords", "소드 10"],
  ["Page of Swords", "소드 시종"],
  ["Knight of Swords", "소드 기사"],
  ["Queen of Swords", "소드 여왕"],
  ["King of Swords", "소드 왕"],
  ["Ace of Pentacles", "펜타클 에이스"],
  ["Two of Pentacles", "펜타클 2"],
  ["Three of Pentacles", "펜타클 3"],
  ["Four of Pentacles", "펜타클 4"],
  ["Five of Pentacles", "펜타클 5"],
  ["Six of Pentacles", "펜타클 6"],
  ["Seven of Pentacles", "펜타클 7"],
  ["Eight of Pentacles", "펜타클 8"],
  ["Nine of Pentacles", "펜타클 9"],
  ["Ten of Pentacles", "펜타클 10"],
  ["Page of Pentacles", "펜타클 시종"],
  ["Knight of Pentacles", "펜타클 기사"],
  ["Queen of Pentacles", "펜타클 여왕"],
  ["King of Pentacles", "펜타클 왕"],
];

function getArcanaGroup(cardIndex) {
  if (cardIndex <= 21) {
    return { id: "major", label: "메이저", vibe: "전환점", focus: "큰 흐름과 방향성" };
  }
  if (cardIndex <= 35) {
    return { id: "wands", label: "완드", vibe: "추진력", focus: "행동과 동기" };
  }
  if (cardIndex <= 49) {
    return { id: "cups", label: "컵", vibe: "감정선", focus: "관계와 감정 교류" };
  }
  if (cardIndex <= 63) {
    return { id: "swords", label: "소드", vibe: "판단력", focus: "생각과 의사결정" };
  }
  return { id: "pentacles", label: "펜타클", vibe: "현실감", focus: "돈과 생활 기반" };
}

function buildDummy(masterId, cardIndex) {
  const profile = masterProfile[masterId] ?? {
    tone: "해석형",
    summary: "오늘은 **균형과 선택**의 흐름이 강조됩니다.",
    work: "핵심 한 가지를 정해 실행하면 결과가 좋아집니다.",
    love: "부드럽고 솔직한 대화가 관계에 도움이 됩니다.",
    money: "불필요한 지출을 줄이고 필요한 것에 집중하세요.",
    quote: "지금 가능한 한 걸음을 선택하면 흐름이 열립니다.",
    keywords: ["선택", "균형", "실행", "흐름"],
  };
  const tone = profile.tone;
  const cardNo = cardIndex + 1;
  const item = luckyItems[cardIndex % luckyItems.length];
  const place = luckyPlaces[cardIndex % luckyPlaces.length];
  const caution = cautions[cardIndex % cautions.length];
  const arcana = getArcanaGroup(cardIndex);
  const [titleEn, titleKo] = tarotNames[cardIndex] ?? [`Card ${String(cardNo).padStart(2, "0")}`, `${cardNo}번 카드`];

  return {
    titleEn,
    titleKo,
    cardSubtitle: `${cardNo}번 카드 · ${titleKo} · ${arcana.label} · ${tone} 더미 해석`,
    summary: `${profile.summary} ${arcana.label} 구간에서는 **${arcana.vibe}**이 특히 강합니다. 카드 ${cardNo}의 신호는 "작게 시작해도 충분하다"입니다.`,
    categories: {
      work: `${profile.work} 이번 카드는 ${arcana.focus}에서 **정리 후 실행**을 강조합니다.`,
      love: `${profile.love} ${arcana.label} 흐름답게 감정의 균형이 핵심입니다.`,
      money: `${profile.money} ${arcana.label} 에너지에서는 지출 우선순위 점검이 필요합니다.`,
    },
    advice: {
      quote: `${tone} 메시지: "${profile.quote}"`,
      luckyItem: item,
      luckyPlace: place,
      caution,
    },
    keywords: [...profile.keywords, `카드${cardNo}`],
  };
}

async function run() {
  const entries = await readdir(readingsDir);
  const targets = entries.filter((name) => name.endsWith(".json"));

  for (const fileName of targets) {
    const masterId = fileName.replace(".json", "");
    const filePath = path.join(readingsDir, fileName);
    const raw = await readFile(filePath, "utf8");
    void JSON.parse(raw);
    const next = {};

    for (let i = 0; i < 78; i += 1) {
      next[String(i)] = buildDummy(masterId, i);
    }

    await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    console.log(`updated ${fileName}`);
  }

  console.log(`done: ${targets.length} files`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
