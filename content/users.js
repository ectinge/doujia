// 代号 → 用户库（content/user-pool.js）。代号与 _post/*.md 中一致；覆盖字段写在第二个参数里。
const P=(id,o={})=>({...window.DOUJIA_USER_POOL.get(id),...o});
window.DOJIA_USERS = {
  "A1": P("wb_tree", { ip: "上海" }), // 浇死公司发财树
  "F1": P("xhs_rabbit"), // ₍ᐢ.‸.⑅ᐢ₎
  "G1": P("db_life"), // 其实你的人生更可笑
  "H1": P("dy_mcflurry"), // 淋雨的麦旋风
  "CP2": P("db_duck"), // 冰岛大肥鸭
  "J1": P("xhs_drunk"), // SlightlyDrunk
  "K1": P("db_bed"), // 不想起床
  "L1": P("db_liar"), // 江湖骗子
  "B1": P("xhs_breeze"), // breeze&chill
  "M1": P("xhs_ideal"), // 你的理想还长存吗
  "N1": P("xhs_unsubscribe"), // 求人生退订教程
  "PGZ": P("db_juice"), // 🧃
  "E1": P("wb_chuntao"), // 春桃酱
  "CP1": P("xhs_academy"), // 嗑学院院士王春华
  "P1": P("qq_raspberry"), // 小树莓儿
  "MM": P("db_momo_guangxi"), // momo
  "R1": P("dy_peach"), // 是🍑🍑呀
  "S1": P("xhs_potatoR"), // momo
  "BND": P("db_worse"), // 明天会更坏
  "T1": P("xhs_mashu"), // 麻薯绊倒了
  "C2": P("db_pharma"), // 小零制药
  "D2": P("db_suspicious"), // 哥你疑心病别这么重
  "F2": P("xhs_crying"), // 含泪变性法哭男友
  "G2": P("wb_midnight"), // 午夜罗曼蒂克小妈
  "A2": P("db_sheep"), // 一🐏迁徙
  "H2": P("dy_intestine"), // 我不吃肥肠爱吃你吃吧
  "B2": P("db_milk"), // 奶比饲养员
  "I2": P("xhs_pancake"), // 煎饼狗子
  "J2": P("qq_mw"), // 猛扇mw传媒那一夜
  "A3": P("db_sophia", { ip: "安徽" }), // Sophia704
  "D3": P("dy_yang"), // 杨小五
  "E3": P("dy_sunkissed"), // -Sunkissed-
  "C3": P("db_ysu"), // YsuLx_Tw
  "F3": P("db_meat"), // 将中产细细切作臊子
  "G3": P("xhs_wave"), // 大波浪鼠片
  "B3": P("db_obubble"), // O泡裹奶
  "H3": P("xhs_potatoTG"), // momo
  "A4": P("db_magic"), // 魔法少女章北海
  "A5": P("db_free"), // 免费超度塌房男
  "A6": P("qq_toast"), // 可可烤面包
  "A7": P("xhs_handy"), // 调你顺手的事
  "A8": P("xhs_potato124"), // momo
  me: { name: "缜密研究", avatar: "assets/avatars/me.svg", ip: "未知" }
};
