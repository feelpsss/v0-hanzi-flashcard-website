"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Plus, Check, X, FolderPlus, Trash2, Star } from "lucide-react"

const HANZI_CATALOG = {
  aulas: [
    // Aula 2 - Números
    { hanzi: "一", pinyin: "yī", meaning: "um" },
    { hanzi: "二", pinyin: "èr", meaning: "dois" },
    { hanzi: "三", pinyin: "sān", meaning: "três" },
    { hanzi: "四", pinyin: "sì", meaning: "quatro" },
    { hanzi: "五", pinyin: "wǔ", meaning: "cinco" },
    { hanzi: "六", pinyin: "liù", meaning: "seis" },
    { hanzi: "七", pinyin: "qī", meaning: "sete" },
    { hanzi: "八", pinyin: "bā", meaning: "oito" },
    { hanzi: "九", pinyin: "jiǔ", meaning: "nove" },
    { hanzi: "十", pinyin: "shí", meaning: "dez" },
    // Aula 3 - Básicos
    { hanzi: "人", pinyin: "rén", meaning: "pessoa" },
    { hanzi: "大", pinyin: "dà", meaning: "grande" },
    { hanzi: "口", pinyin: "kǒu", meaning: "boca; entrada" },
    { hanzi: "中", pinyin: "zhōng", meaning: "meio; médio; centro" },
    { hanzi: "小", pinyin: "xiǎo", meaning: "pequeno" },
    { hanzi: "上", pinyin: "shàng", meaning: "cima; acima; começar; início" },
    { hanzi: "下", pinyin: "xià", meaning: "baixo; abaixo; finalizar" },
    // Aula 4 - Estudo
    { hanzi: "国", pinyin: "guó", meaning: "país" },
    { hanzi: "学", pinyin: "xué", meaning: "estudar" },
    { hanzi: "习", pinyin: "xí", meaning: "praticar; morfema de ligação" },
    { hanzi: "汉", pinyin: "hàn", meaning: "dinastia Han; povo chinês" },
    { hanzi: "语", pinyin: "yǔ", meaning: "linguagem, idioma" },
    { hanzi: "文", pinyin: "wén", meaning: "língua escrita, civilização, cultura" },
    { hanzi: "写", pinyin: "xiě", meaning: "escrever" },
    { hanzi: "字", pinyin: "zì", meaning: "caractere, letra, nome" },
    // Aula 5
    { hanzi: "女", pinyin: "nǚ", meaning: "mulher; feminino" },
    { hanzi: "子", pinyin: "zǐ", meaning: "filho; criança" },
    { hanzi: "好", pinyin: "hǎo", meaning: "bom; bem; ok" },
    { hanzi: "水", pinyin: "shuǐ", meaning: "água" },
    { hanzi: "门", pinyin: "mén", meaning: "porta" },
    { hanzi: "王", pinyin: "wáng", meaning: "rei" },
    // Aula 6
    { hanzi: "日", pinyin: "rì", meaning: "sol, dia" },
    { hanzi: "月", pinyin: "yuè", meaning: "lua, mês" },
    { hanzi: "木", pinyin: "mù", meaning: "árvore, madeira" },
    { hanzi: "马", pinyin: "mǎ", meaning: "cavalo" },
    { hanzi: "田", pinyin: "tián", meaning: "campo para cultivo" },
    { hanzi: "天", pinyin: "tiān", meaning: "céu, dia" },
    { hanzi: "明", pinyin: "míng", meaning: "brilhante, amanhã" },
    { hanzi: "林", pinyin: "lín", meaning: "bosque" },
    { hanzi: "休", pinyin: "xiū", meaning: "descansar" },
    { hanzi: "男", pinyin: "nán", meaning: "homem" },
    { hanzi: "妈", pinyin: "mā", meaning: "mãe, mamãe" },
    { hanzi: "河", pinyin: "hé", meaning: "rio" },
    { hanzi: "们", pinyin: "men", meaning: "partícula de plural" },
    { hanzi: "问", pinyin: "wèn", meaning: "perguntar" },
    // Aula 8 e 9
    { hanzi: "您", pinyin: "nín", meaning: "você (formal, respeitoso)" },
    { hanzi: "贵", pinyin: "guì", meaning: "caro, valioso, honrado" },
    { hanzi: "姓", pinyin: "xìng", meaning: "sobrenome, sobrenomear" },
    { hanzi: "我", pinyin: "wǒ", meaning: "eu" },
    { hanzi: "是", pinyin: "shì", meaning: "ser (verbo)" },
    { hanzi: "呢", pinyin: "ne", meaning: "partícula de pergunta (e...?)" },
    { hanzi: "吗", pinyin: "ma", meaning: "partícula de pergunta (s/n)" },
    { hanzi: "不", pinyin: "bù", meaning: "não (adv. Negação)" },
    { hanzi: "他", pinyin: "tā", meaning: "ele" },
    { hanzi: "她", pinyin: "tā", meaning: "ela" },
    { hanzi: "你", pinyin: "nǐ", meaning: "você (informal)" },
    { hanzi: "老", pinyin: "lǎo", meaning: "velho, idoso, experiente" },
    { hanzi: "师", pinyin: "shī", meaning: "mestre, professor" },
    // Aula 10 e 11
    { hanzi: "什", pinyin: "shén", meaning: "o que?" },
    { hanzi: "么", pinyin: "me", meaning: "sufixo, morfema" },
    { hanzi: "名", pinyin: "míng", meaning: "nome" },
    { hanzi: "叫", pinyin: "jiào", meaning: "chamar, chamar-se" },
    { hanzi: "哪", pinyin: "nǎ", meaning: "onde; qual" },
    { hanzi: "说", pinyin: "shuō", meaning: "falar" },
    { hanzi: "也", pinyin: "yě", meaning: "também" },
    { hanzi: "都", pinyin: "dōu", meaning: "todos, ambos" },
    { hanzi: "只", pinyin: "zhǐ", meaning: "só, somente" },
    { hanzi: "还是", pinyin: "háishi", meaning: "ou" },
    // Aula 12 e 13
    { hanzi: "很", pinyin: "hěn", meaning: "muito" },
    { hanzi: "高", pinyin: "gāo", meaning: "alto" },
    { hanzi: "兴", pinyin: "xìng", meaning: "animado, interessado" },
    { hanzi: "认", pinyin: "rèn", meaning: "reconhecer; saber" },
    { hanzi: "识", pinyin: "shí", meaning: "conhecimento; saber" },
    { hanzi: "在", pinyin: "zài", meaning: "estar, ficar (em)" },
    { hanzi: "工", pinyin: "gōng", meaning: "trabalho" },
    { hanzi: "作", pinyin: "zuò", meaning: "fazer, trabalho" },
    { hanzi: "司", pinyin: "sī", meaning: "administrar; empresa" },
    { hanzi: "进", pinyin: "jìn", meaning: "entrar" },
    { hanzi: "出", pinyin: "chū", meaning: "sair" },
    { hanzi: "系", pinyin: "xì", meaning: "departamento (universitário)" },
    { hanzi: "可", pinyin: "kě", meaning: "poder" },
    { hanzi: "以", pinyin: "yǐ", meaning: "por meio de; usar como" },
    // Aula 14
    { hanzi: "电", pinyin: "diàn", meaning: "eletricidade" },
    { hanzi: "打", pinyin: "dǎ", meaning: "(v.) bater" },
    { hanzi: "话", pinyin: "huà", meaning: "fala; dialeto" },
    { hanzi: "和", pinyin: "hé", meaning: "(prep.) e" },
    { hanzi: "号", pinyin: "hǎo", meaning: "número; dia (informal)" },
    { hanzi: "码", pinyin: "mǎ", meaning: "número; código; senha" },
    { hanzi: "零", pinyin: "líng", meaning: "número 0" },
    { hanzi: "发", pinyin: "fā", meaning: "(v.) enviar por meio eletrônico" },
    { hanzi: "邮", pinyin: "yóu", meaning: "correio" },
    { hanzi: "件", pinyin: "jiàn", meaning: "item" },
    { hanzi: "给", pinyin: "gěi", meaning: "(v.) dar; (prep.) para" },
    // Aula 15
    { hanzi: "院", pinyin: "yuàn", meaning: "pátio, instituição" },
    { hanzi: "怎", pinyin: "zěn", meaning: "como" },
    { hanzi: "样", pinyin: "yàng", meaning: "aparência, tipo" },
    { hanzi: "漂", pinyin: "piào", meaning: "bonito (parte de 漂亮)" },
    { hanzi: "亮", pinyin: "liàng", meaning: "brilhante (parte de 漂亮)" },
    { hanzi: "喜", pinyin: "xǐ", meaning: "gostar, alegria" },
    { hanzi: "这", pinyin: "zhè", meaning: "este" },
    { hanzi: "朋", pinyin: "péng", meaning: "amigo (parte de 朋友)" },
    { hanzi: "友", pinyin: "yǒu", meaning: "amigo" },
    { hanzi: "请", pinyin: "qǐng", meaning: "por favor; convidar" },
    { hanzi: "坐", pinyin: "zuò", meaning: "sentar" },
    { hanzi: "谢", pinyin: "xiè", meaning: "agradecer" },
    { hanzi: "喝", pinyin: "hē", meaning: "beber" },
    { hanzi: "茶", pinyin: "chá", meaning: "chá" },
    { hanzi: "儿", pinyin: "ér", meaning: "filho, sufixo diminutivo" },
    { hanzi: "里", pinyin: "lǐ", meaning: "dentro, quilômetro" },
    { hanzi: "欢", pinyin: "huān", meaning: "alegre, feliz" },
    { hanzi: "那", pinyin: "nà", meaning: "aquele" },
  ],
  licao3: [
    { hanzi: "地方", pinyin: "dìfāng", meaning: "lugar, local, sítio" },
    { hanzi: "个", pinyin: "gè", meaning: "classificador" },
    { hanzi: "这儿", pinyin: "zhèr", meaning: "aqui (também 这里 zhèlǐ)" },
    { hanzi: "家", pinyin: "jiā", meaning: "família; casa" },
    { hanzi: "有", pinyin: "yǒu", meaning: "ter, haver" },
    { hanzi: "几", pinyin: "jǐ", meaning: "quantos, quantas" },
    { hanzi: "口", pinyin: "kǒu", meaning: "classificador para pessoas" },
    { hanzi: "爸爸", pinyin: "bàba", meaning: "pai" },
    { hanzi: "妈妈", pinyin: "māma", meaning: "mãe" },
    { hanzi: "和", pinyin: "hé", meaning: "e" },
    { hanzi: "太太", pinyin: "tàitai", meaning: "esposa, mulher" },
    { hanzi: "孩子", pinyin: "háizi", meaning: "criança; filho" },
    { hanzi: "男孩儿", pinyin: "nánháir", meaning: "menino, rapaz" },
    { hanzi: "女孩儿", pinyin: "nǚháir", meaning: "menina, rapariga" },
    { hanzi: "多大", pinyin: "duō dà", meaning: "quantos anos" },
    { hanzi: "两", pinyin: "liǎng", meaning: "dois" },
    { hanzi: "岁", pinyin: "suì", meaning: "anos de idade" },
    { hanzi: "可爱", pinyin: "kě'ài", meaning: "querido" },
    { hanzi: "吧", pinyin: "ba", meaning: "partícula" },
    { hanzi: "学校", pinyin: "xuéxiào", meaning: "escola, instituição de ensino" },
    { hanzi: "多少", pinyin: "duōshao", meaning: "quanto(s)" },
    { hanzi: "学生", pinyin: "xuéshēng", meaning: "aluno" },
    { hanzi: "想", pinyin: "xiǎng", meaning: "pensar" },
    { hanzi: "大概", pinyin: "dàgài", meaning: "aproximadamente, por volta de" },
    { hanzi: "万", pinyin: "wàn", meaning: "dez mil" },
    { hanzi: "没有", pinyin: "méiyǒu", meaning: "não há" },
    { hanzi: "多", pinyin: "duō", meaning: "muito" },
    { hanzi: "千", pinyin: "qiān", meaning: "mil" },
    { hanzi: "去", pinyin: "qù", meaning: "ir" },
    { hanzi: "为什么", pinyin: "wèishénme", meaning: "por quê?" },
    { hanzi: "为", pinyin: "wèi", meaning: "para" },
    { hanzi: "分公司", pinyin: "fēn gōngsī", meaning: "sucursal/filial de companhia" },
    { hanzi: "老板", pinyin: "lǎobǎn", meaning: "patrão" },
    { hanzi: "让", pinyin: "ràng", meaning: "deixar, permitir" },
    { hanzi: "那儿", pinyin: "nàr", meaning: "lá, ali (também 那里 nàlǐ)" },
    { hanzi: "百", pinyin: "bǎi", meaning: "cem, cento" },
    { hanzi: "少", pinyin: "shǎo", meaning: "pouco" },
    { hanzi: "因为", pinyin: "yīnwèi", meaning: "porque" },
  ],
  licao4: [
    { hanzi: "地图", pinyin: "dìtú", meaning: "mapa" },
    { hanzi: "张", pinyin: "zhāng", meaning: "classificador para folhas de papel, mapas etc." },
    { hanzi: "中文", pinyin: "Zhōngwén", meaning: "língua chinesa, chinês" },
    { hanzi: "葡萄牙文", pinyin: "Pútáoyáwén", meaning: "língua portuguesa, português" },
    { hanzi: "看", pinyin: "kàn", meaning: "ver, olhar" },
    { hanzi: "一下", pinyin: "yíxià", meaning: "um pouco; por um momento" },
    { hanzi: "行", pinyin: "xíng", meaning: "claro que sim; está bem" },
    { hanzi: "要", pinyin: "yào", meaning: "querer, precisar" },
    { hanzi: "给", pinyin: "gěi", meaning: "dar" },
    { hanzi: "干", pinyin: "gān", meaning: "fazer" },
    { hanzi: "是的", pinyin: "shì de", meaning: "sim" },
    { hanzi: "玩儿", pinyin: "wánr", meaning: "fazer uma viagem a; divertir-se" },
    { hanzi: "知道", pinyin: "zhīdao", meaning: "conhecer; saber" },
    { hanzi: "比较", pinyin: "bǐjiào", meaning: "comparativamente" },
    { hanzi: "真", pinyin: "zhēn", meaning: "que... tão!; realmente" },
    { hanzi: "有意思", pinyin: "yǒu yìsi", meaning: "interessante" },
    { hanzi: "意思", pinyin: "yìsi", meaning: "interesse" },
    { hanzi: "龙", pinyin: "lóng", meaning: "dragão" },
    { hanzi: "山", pinyin: "shān", meaning: "montanha, monte" },
    { hanzi: "词典", pinyin: "cídiǎn", meaning: "dicionário" },
    { hanzi: "汉葡词典", pinyin: "Hàn-Pú cídiǎn", meaning: "dicionário chinês-português" },
    { hanzi: "葡汉词典", pinyin: "Pú-Hàn cídiǎn", meaning: "dicionário português-chinês" },
    { hanzi: "本", pinyin: "běn", meaning: "classificador para livros" },
    { hanzi: "谁", pinyin: "shéi / shuí", meaning: "quem" },
    { hanzi: "请问", pinyin: "qǐng wèn", meaning: "desculpe; para perguntar algo" },
    { hanzi: "问", pinyin: "wèn", meaning: "perguntar" },
    { hanzi: "对", pinyin: "duì", meaning: "correto, sim" },
    { hanzi: "非常", pinyin: "fēicháng", meaning: "muito" },
    { hanzi: "有用", pinyin: "yǒuyòng", meaning: "útil" },
    { hanzi: "能", pinyin: "néng", meaning: "poder" },
    { hanzi: "用", pinyin: "yòng", meaning: "usar" },
    { hanzi: "当然", pinyin: "dāngrán", meaning: "certamente, com certeza" },
    { hanzi: "书", pinyin: "shū", meaning: "livro" },
    { hanzi: "本子", pinyin: "běnzi", meaning: "caderno" },
    { hanzi: "笔", pinyin: "bǐ", meaning: "caneta, lápis" },
    { hanzi: "支", pinyin: "zhī", meaning: "classificador para caneta, lápis etc." },
    { hanzi: "教室", pinyin: "jiàoshì", meaning: "sala de aula" },
    { hanzi: "上课", pinyin: "shàng kè", meaning: "ter aulas" },
  ],
  licao5: [
    { hanzi: "小姐", pinyin: "xiǎojiě", meaning: "senhorita; empregada" },
    { hanzi: "会", pinyin: "huì", meaning: "saber" },
    { hanzi: "一点儿", pinyin: "yìdiǎnr", meaning: "um pouco" },
    { hanzi: "先生", pinyin: "xiānsheng", meaning: "senhor" },
    { hanzi: "买", pinyin: "mǎi", meaning: "comprar" },
    { hanzi: "件", pinyin: "jiàn", meaning: "classificador para roupa" },
    { hanzi: "衬衫", pinyin: "chènshān", meaning: "camisa" },
    { hanzi: "白", pinyin: "bái", meaning: "branco" },
    { hanzi: "钱", pinyin: "qián", meaning: "dinheiro" },
    { hanzi: "块", pinyin: "kuài", meaning: "unidade de Renminbi (元 yuán)" },
    { hanzi: "太", pinyin: "tài", meaning: "excessivamente, demais (太……了 = tão...!; 不太…… = não muito...)" },
    { hanzi: "贵", pinyin: "guì", meaning: "caro" },
    { hanzi: "红", pinyin: "hóng", meaning: "vermelho" },
    { hanzi: "便宜", pinyin: "piányi", meaning: "barato" },
    { hanzi: "还", pinyin: "hái", meaning: "ainda; também" },
    { hanzi: "条", pinyin: "tiáo", meaning: "classificador para calças, saia, rua, rio, peixe etc." },
    { hanzi: "裤子", pinyin: "kùzi", meaning: "calças" },
    { hanzi: "试", pinyin: "shì", meaning: "experimentar, provar" },
    { hanzi: "那", pinyin: "nà", meaning: "nessa situação, nesse caso" },
    { hanzi: "来", pinyin: "lái", meaning: "vir" },
    { hanzi: "饭店", pinyin: "fàndiàn", meaning: "restaurante" },
    { hanzi: "最", pinyin: "zuì", meaning: "o mais" },
    { hanzi: "好吃", pinyin: "hǎochī", meaning: "delicioso, saboroso" },
    { hanzi: "菜", pinyin: "cài", meaning: "prato" },
    { hanzi: "糖醋鱼", pinyin: "tángcùyú", meaning: "peixe agridoce" },
    { hanzi: "糖", pinyin: "táng", meaning: "açúcar" },
    { hanzi: "醋", pinyin: "cù", meaning: "vinagre" },
    { hanzi: "鱼", pinyin: "yú", meaning: "peixe" },
    { hanzi: "吃", pinyin: "chī", meaning: "comer" },
    { hanzi: "辣", pinyin: "là", meaning: "picante" },
    { hanzi: "酸辣汤", pinyin: "suānlàtāng", meaning: "sopa avinagrada e picante" },
    { hanzi: "酸", pinyin: "suān", meaning: "ácido, avinagrado" },
    { hanzi: "汤", pinyin: "tāng", meaning: "sopa, caldo" },
    { hanzi: "牛肉", pinyin: "niúròu", meaning: "carne de vaca" },
    { hanzi: "牛", pinyin: "niú", meaning: "boi, vaca" },
    { hanzi: "肉", pinyin: "ròu", meaning: "carne" },
    { hanzi: "红烧", pinyin: "hóngshāo", meaning: "guisado em molho de soja" },
    { hanzi: "米饭", pinyin: "mǐfàn", meaning: "arroz cozido" },
    { hanzi: "水饺", pinyin: "shuǐjiǎo", meaning: "ravióis chineses (também 饺子 jiǎozi)" },
    { hanzi: "瓶", pinyin: "píng", meaning: "garrafa" },
    { hanzi: "啤酒", pinyin: "píjiǔ", meaning: "cerveja" },
    { hanzi: "等", pinyin: "děng", meaning: "esperar" },
    { hanzi: "东西", pinyin: "dōngxi", meaning: "coisa" },
    { hanzi: "买东西", pinyin: "mǎi dōngxi", meaning: "fazer compras" },
    { hanzi: "商店", pinyin: "shāngdiàn", meaning: "loja" },
    { hanzi: "卖", pinyin: "mài", meaning: "vender" },
    { hanzi: "衣服", pinyin: "yīfu", meaning: "roupa, vestuário" },
  ],
  hsk1: [
    { hanzi: "你", pinyin: "nǐ", meaning: "você" },
    { hanzi: "好", pinyin: "hǎo", meaning: "bom, bem" },
    { hanzi: "我", pinyin: "wǒ", meaning: "eu" },
    { hanzi: "是", pinyin: "shì", meaning: "ser" },
    { hanzi: "的", pinyin: "de", meaning: "partícula possessiva" },
    { hanzi: "了", pinyin: "le", meaning: "partícula de aspecto" },
    { hanzi: "不", pinyin: "bù", meaning: "não" },
    { hanzi: "在", pinyin: "zài", meaning: "estar em" },
    { hanzi: "人", pinyin: "rén", meaning: "pessoa" },
    { hanzi: "有", pinyin: "yǒu", meaning: "ter" },
    { hanzi: "他", pinyin: "tā", meaning: "ele" },
    { hanzi: "这", pinyin: "zhè", meaning: "este" },
    { hanzi: "中", pinyin: "zhōng", meaning: "meio, China" },
    { hanzi: "大", pinyin: "dà", meaning: "grande" },
    { hanzi: "来", pinyin: "lái", meaning: "vir" },
    { hanzi: "上", pinyin: "shàng", meaning: "acima" },
    { hanzi: "国", pinyin: "guó", meaning: "país" },
    { hanzi: "个", pinyin: "gè", meaning: "classificador geral" },
    { hanzi: "到", pinyin: "dào", meaning: "chegar" },
    { hanzi: "说", pinyin: "shuō", meaning: "dizer" },
    { hanzi: "们", pinyin: "men", meaning: "marcador de plural" },
    { hanzi: "为", pinyin: "wèi", meaning: "para, por" },
    { hanzi: "子", pinyin: "zǐ", meaning: "filho, semente" },
    { hanzi: "和", pinyin: "hé", meaning: "e, com" },
    { hanzi: "地", pinyin: "dì", meaning: "terra, chão" },
    { hanzi: "出", pinyin: "chū", meaning: "sair" },
    { hanzi: "道", pinyin: "dào", meaning: "caminho, via" },
    { hanzi: "也", pinyin: "yě", meaning: "também" },
    { hanzi: "时", pinyin: "shí", meaning: "tempo" },
    { hanzi: "年", pinyin: "nián", meaning: "ano" },
    { hanzi: "得", pinyin: "de/dé/děi", meaning: "obter, poder" },
    { hanzi: "就", pinyin: "jiù", meaning: "então, exatamente" },
    { hanzi: "那", pinyin: "nà", meaning: "aquele" },
    { hanzi: "要", pinyin: "yào", meaning: "querer, precisar" },
    { hanzi: "下", pinyin: "xià", meaning: "abaixo" },
    { hanzi: "以", pinyin: "yǐ", meaning: "com, usar" },
    { hanzi: "生", pinyin: "shēng", meaning: "nascer, vida" },
    { hanzi: "会", pinyin: "huì", meaning: "saber fazer, reunião" },
    { hanzi: "天", pinyin: "tiān", meaning: "céu, dia" },
    { hanzi: "过", pinyin: "guò", meaning: "passar" },
    { hanzi: "能", pinyin: "néng", meaning: "poder" },
    { hanzi: "她", pinyin: "tā", meaning: "ela" },
    { hanzi: "多", pinyin: "duō", meaning: "muito" },
    { hanzi: "去", pinyin: "qù", meaning: "ir" },
    { hanzi: "做", pinyin: "zuò", meaning: "fazer" },
    { hanzi: "想", pinyin: "xiǎng", meaning: "pensar, querer" },
    { hanzi: "看", pinyin: "kàn", meaning: "ver, olhar" },
    { hanzi: "几", pinyin: "jǐ/jī", meaning: "quantos, alguns" },
    { hanzi: "吗", pinyin: "ma", meaning: "partícula interrogativa" },
    { hanzi: "呢", pinyin: "ne", meaning: "partícula interrogativa" },
    { hanzi: "吧", pinyin: "ba", meaning: "partícula sugestiva" },
    { hanzi: "啊", pinyin: "ā", meaning: "partícula exclamativa" },
    { hanzi: "叫", pinyin: "jiào", meaning: "chamar, ser chamado" },
    { hanzi: "喜", pinyin: "xǐ", meaning: "gostar, alegria" },
    { hanzi: "欢", pinyin: "huān", meaning: "alegre, feliz" },
    { hanzi: "爱", pinyin: "ài", meaning: "amor, amar" },
    { hanzi: "买", pinyin: "mǎi", meaning: "comprar" },
    { hanzi: "卖", pinyin: "mài", meaning: "vender" },
    { hanzi: "吃", pinyin: "chī", meaning: "comer" },
    { hanzi: "喝", pinyin: "hē", meaning: "beber" },
  ],
  hsk2: [
    { hanzi: "对", pinyin: "duì", meaning: "correto, para" },
    { hanzi: "自", pinyin: "zì", meaning: "próprio" },
    { hanzi: "事", pinyin: "shì", meaning: "assunto, coisa" },
    { hanzi: "起", pinyin: "qǐ", meaning: "levantar" },
    { hanzi: "还", pinyin: "hái/huán", meaning: "ainda, devolver" },
    { hanzi: "用", pinyin: "yòng", meaning: "usar" },
    { hanzi: "家", pinyin: "jiā", meaning: "casa, família" },
    { hanzi: "方", pinyin: "fāng", meaning: "quadrado, direção" },
    { hanzi: "开", pinyin: "kāi", meaning: "abrir" },
    { hanzi: "手", pinyin: "shǒu", meaning: "mão" },
    { hanzi: "水", pinyin: "shuǐ", meaning: "água" },
    { hanzi: "小", pinyin: "xiǎo", meaning: "pequeno" },
    { hanzi: "从", pinyin: "cóng", meaning: "de, desde" },
    { hanzi: "现", pinyin: "xiàn", meaning: "aparecer, presente" },
    { hanzi: "己", pinyin: "jǐ", meaning: "próprio" },
    { hanzi: "者", pinyin: "zhě", meaning: "pessoa, -ista" },
    { hanzi: "月", pinyin: "yuè", meaning: "lua, mês" },
    { hanzi: "把", pinyin: "bǎ", meaning: "segurar, marcador de objeto" },
    { hanzi: "见", pinyin: "jiàn", meaning: "ver" },
    { hanzi: "第", pinyin: "dì", meaning: "prefixo ordinal" },
    { hanzi: "问", pinyin: "wèn", meaning: "perguntar" },
    { hanzi: "长", pinyin: "cháng/zhǎng", meaning: "longo, crescer" },
    { hanzi: "日", pinyin: "rì", meaning: "sol, dia" },
    { hanzi: "最", pinyin: "zuì", meaning: "mais (superlativo)" },
    { hanzi: "分", pinyin: "fēn/fèn", meaning: "dividir, minuto" },
    { hanzi: "前", pinyin: "qián", meaning: "frente, anterior" },
    { hanzi: "外", pinyin: "wài", meaning: "fora" },
    { hanzi: "定", pinyin: "dìng", meaning: "fixo, decidir" },
    { hanzi: "给", pinyin: "gěi", meaning: "dar, para" },
    { hanzi: "名", pinyin: "míng", meaning: "nome" },
    { hanzi: "成", pinyin: "chéng", meaning: "tornar-se, sucesso" },
    { hanzi: "学", pinyin: "xué", meaning: "estudar" },
    { hanzi: "当", pinyin: "dāng/dàng", meaning: "quando, servir como" },
    { hanzi: "体", pinyin: "tǐ", meaning: "corpo" },
    { hanzi: "样", pinyin: "yàng", meaning: "aparência, tipo" },
    { hanzi: "新", pinyin: "xīn", meaning: "novo" },
    { hanzi: "知", pinyin: "zhī", meaning: "saber" },
    { hanzi: "作", pinyin: "zuò", meaning: "fazer, trabalho" },
    { hanzi: "等", pinyin: "děng", meaning: "esperar, etc." },
    { hanzi: "老", pinyin: "lǎo", meaning: "velho" },
    { hanzi: "听", pinyin: "tīng", meaning: "ouvir" },
    { hanzi: "读", pinyin: "dú", meaning: "ler" },
    { hanzi: "写", pinyin: "xiě", meaning: "escrever" },
    { hanzi: "话", pinyin: "huà", meaning: "palavra, fala" },
    { hanzi: "住", pinyin: "zhù", meaning: "morar, viver" },
    { hanzi: "路", pinyin: "lù", meaning: "caminho, estrada" },
    { hanzi: "走", pinyin: "zǒu", meaning: "andar, caminhar" },
    { hanzi: "跑", pinyin: "pǎo", meaning: "correr" },
    { hanzi: "站", pinyin: "zhàn", meaning: "ficar de pé, estação" },
    { hanzi: "坐", pinyin: "zuò", meaning: "sentar" },
    { hanzi: "睡", pinyin: "shuì", meaning: "dormir" },
    { hanzi: "觉", pinyin: "jiào/jué", meaning: "dormir, sentir" },
    { hanzi: "穿", pinyin: "chuān", meaning: "vestir, usar roupa" },
    { hanzi: "衣", pinyin: "yī", meaning: "roupa" },
    { hanzi: "服", pinyin: "fú", meaning: "roupa, servir" },
    { hanzi: "鞋", pinyin: "xié", meaning: "sapato" },
    { hanzi: "帽", pinyin: "mào", meaning: "chapéu" },
    { hanzi: "眼", pinyin: "yǎn", meaning: "olho" },
    { hanzi: "睛", pinyin: "jīng", meaning: "olho (parte de 眼睛)" },
    { hanzi: "耳", pinyin: "ěr", meaning: "orelha" },
    { hanzi: "朵", pinyin: "duǒ", meaning: "classificador para flores e orelhas" },
    { hanzi: "口", pinyin: "kǒu", meaning: "boca" },
    { hanzi: "鼻", pinyin: "bí", meaning: "nariz" },
    { hanzi: "头", pinyin: "tóu", meaning: "cabeça" },
    { hanzi: "脸", pinyin: "liǎn", meaning: "rosto" },
    { hanzi: "脚", pinyin: "jiǎo", meaning: "pé" },
    { hanzi: "腿", pinyin: "tuǐ", meaning: "perna" },
  ],
  hsk3: [
    { hanzi: "才", pinyin: "cái", meaning: "apenas, talento" },
    { hanzi: "民", pinyin: "mín", meaning: "povo" },
    { hanzi: "文", pinyin: "wén", meaning: "texto, cultura" },
    { hanzi: "理", pinyin: "lǐ", meaning: "razão, gerenciar" },
    { hanzi: "发", pinyin: "fā", meaning: "emitir, desenvolver" },
    { hanzi: "气", pinyin: "qì", meaning: "ar, energia" },
    { hanzi: "动", pinyin: "dòng", meaning: "mover" },
    { hanzi: "意", pinyin: "yì", meaning: "significado, intenção" },
    { hanzi: "心", pinyin: "xīn", meaning: "coração" },
    { hanzi: "面", pinyin: "miàn", meaning: "face, superfície" },
    { hanzi: "力", pinyin: "lì", meaning: "força" },
    { hanzi: "高", pinyin: "gāo", meaning: "alto" },
    { hanzi: "本", pinyin: "běn", meaning: "origem, livro" },
    { hanzi: "经", pinyin: "jīng", meaning: "passar por, sutra" },
    { hanzi: "门", pinyin: "mén", meaning: "porta" },
    { hanzi: "工", pinyin: "gōng", meaning: "trabalho, operário" },
    { hanzi: "然", pinyin: "rán", meaning: "assim, naturalmente" },
    { hanzi: "没", pinyin: "méi", meaning: "não ter" },
    { hanzi: "间", pinyin: "jiān/jiàn", meaning: "entre, espaço" },
    { hanzi: "行", pinyin: "xíng/háng", meaning: "andar, linha" },
    { hanzi: "相", pinyin: "xiāng/xiàng", meaning: "mutuamente, aparência" },
    { hanzi: "因", pinyin: "yīn", meaning: "causa" },
    { hanzi: "同", pinyin: "tóng", meaning: "mesmo" },
    { hanzi: "三", pinyin: "sān", meaning: "três" },
    { hanzi: "已", pinyin: "yǐ", meaning: "já" },
    { hanzi: "两", pinyin: "liǎng", meaning: "dois" },
    { hanzi: "些", pinyin: "xiē", meaning: "alguns" },
    { hanzi: "无", pinyin: "wú", meaning: "não ter, sem" },
    { hanzi: "认", pinyin: "rèn", meaning: "reconhecer" },
    { hanzi: "识", pinyin: "shí/shì", meaning: "conhecimento, reconhecer" },
    { hanzi: "觉", pinyin: "jiào/jué", meaning: "sentir, perceber" },
    { hanzi: "记", pinyin: "jì", meaning: "anotar, lembrar" },
    { hanzi: "忘", pinyin: "wàng", meaning: "esquecer" },
    { hanzi: "懂", pinyin: "dǒng", meaning: "entender" },
    { hanzi: "比", pinyin: "bǐ", meaning: "comparar" },
    { hanzi: "较", pinyin: "jiào", meaning: "comparativamente" },
    { hanzi: "更", pinyin: "gèng", meaning: "mais ainda" },
    { hanzi: "特", pinyin: "tè", meaning: "especial" },
    { hanzi: "别", pinyin: "bié", meaning: "não (imperativo), especial" },
    { hanzi: "其", pinyin: "qí", meaning: "seu, tal" },
    { hanzi: "实", pinyin: "shí", meaning: "real, verdadeiro" },
    { hanzi: "真", pinyin: "zhēn", meaning: "verdadeiro, realmente" },
    { hanzi: "假", pinyin: "jiǎ/jià", meaning: "falso, férias" },
    { hanzi: "错", pinyin: "cuò", meaning: "errado" },
    { hanzi: "完", pinyin: "wán", meaning: "terminar, completo" },
    { hanzi: "始", pinyin: "shǐ", meaning: "começar" },
    { hanzi: "终", pinyin: "zhōng", meaning: "fim" },
    { hanzi: "结", pinyin: "jié/jiē", meaning: "nó, resultado" },
    { hanzi: "束", pinyin: "shù", meaning: "feixe, restringir" },
    { hanzi: "决", pinyin: "jué", meaning: "decidir" },
    { hanzi: "选", pinyin: "xuǎn", meaning: "escolher" },
    { hanzi: "择", pinyin: "zé", meaning: "escolher, selecionar" },
    { hanzi: "改", pinyin: "gǎi", meaning: "mudar, modificar" },
    { hanzi: "变", pinyin: "biàn", meaning: "mudar, transformar" },
    { hanzi: "化", pinyin: "huà", meaning: "transformar, -izar" },
    { hanzi: "需", pinyin: "xū", meaning: "precisar" },
    { hanzi: "必", pinyin: "bì", meaning: "certamente, deve" },
    { hanzi: "须", pinyin: "xū", meaning: "dever, bigode" },
    { hanzi: "该", pinyin: "gāi", meaning: "dever" },
    { hanzi: "应", pinyin: "yīng/yìng", meaning: "dever, responder" },
  ],
  hsk4: [
    { hanzi: "而", pinyin: "ér", meaning: "mas, e (conectivo)" },
    { hanzi: "且", pinyin: "qiě", meaning: "além disso" },
    { hanzi: "况", pinyin: "kuàng", meaning: "situação, além disso" },
    { hanzi: "若", pinyin: "ruò", meaning: "se, como" },
    { hanzi: "虽", pinyin: "suī", meaning: "embora" },
    { hanzi: "尽", pinyin: "jǐn/jìn", meaning: "esgotar, embora" },
    { hanzi: "管", pinyin: "guǎn", meaning: "tubo, gerenciar, embora" },
    { hanzi: "除", pinyin: "chú", meaning: "remover, exceto" },
    { hanzi: "非", pinyin: "fēi", meaning: "não ser, errado" },
    { hanzi: "否", pinyin: "fǒu", meaning: "não (forma negativa)" },
    { hanzi: "另", pinyin: "lìng", meaning: "outro" },
    { hanzi: "各", pinyin: "gè", meaning: "cada" },
    { hanzi: "每", pinyin: "měi", meaning: "cada, todo" },
    { hanzi: "任", pinyin: "rèn", meaning: "qualquer, cargo" },
    { hanzi: "何", pinyin: "hé", meaning: "qual, qualquer" },
    { hanzi: "某", pinyin: "mǒu", meaning: "certo, algum" },
    { hanzi: "整", pinyin: "zhěng", meaning: "inteiro, arrumar" },
    { hanzi: "般", pinyin: "bān", meaning: "tipo, maneira" },
    { hanzi: "普", pinyin: "pǔ", meaning: "universal, comum" },
    { hanzi: "遍", pinyin: "biàn", meaning: "vez, por toda parte" },
    { hanzi: "共", pinyin: "gòng", meaning: "junto, total" },
    { hanzi: "总", pinyin: "zǒng", meaning: "total, sempre" },
    { hanzi: "另", pinyin: "lìng", meaning: "outro" },
    { hanzi: "互", pinyin: "hù", meaning: "mútuo" },
    { hanzi: "彼", pinyin: "bǐ", meaning: "aquele" },
    { hanzi: "此", pinyin: "cǐ", meaning: "este" },
    { hanzi: "双", pinyin: "shuāng", meaning: "par, duplo" },
    { hanzi: "单", pinyin: "dān", meaning: "único, simples" },
    { hanzi: "独", pinyin: "dú", meaning: "sozinho" },
    { hanzi: "孤", pinyin: "gū", meaning: "solitário, órfão" },
    { hanzi: "众", pinyin: "zhòng", meaning: "multidão" },
    { hanzi: "群", pinyin: "qún", meaning: "grupo" },
    { hanzi: "集", pinyin: "jí", meaning: "reunir, coleção" },
    { hanzi: "合", pinyin: "hé", meaning: "combinar, adequado" },
    { hanzi: "联", pinyin: "lián", meaning: "conectar, unir" },
    { hanzi: "接", pinyin: "jiē", meaning: "conectar, receber" },
    { hanzi: "系", pinyin: "xì/jì", meaning: "sistema, amarrar" },
    { hanzi: "关", pinyin: "guān", meaning: "fechar, relação" },
    { hanzi: "键", pinyin: "jiàn", meaning: "chave, tecla" },
    { hanzi: "钥", pinyin: "yào", meaning: "chave (parte de 钥匙)" },
    { hanzi: "匙", pinyin: "shi", meaning: "colher, chave" },
    { hanzi: "锁", pinyin: "suǒ", meaning: "tranca, trancar" },
    { hanzi: "闭", pinyin: "bì", meaning: "fechar" },
    { hanzi: "启", pinyin: "qǐ", meaning: "abrir, iniciar" },
    { hanzi: "推", pinyin: "tuī", meaning: "empurrar" },
    { hanzi: "拉", pinyin: "lā", meaning: "puxar" },
    { hanzi: "抬", pinyin: "tái", meaning: "levantar" },
    { hanzi: "举", pinyin: "jǔ", meaning: "levantar, realizar" },
    { hanzi: "放", pinyin: "fàng", meaning: "colocar, soltar" },
    { hanzi: "置", pinyin: "zhì", meaning: "colocar, posição" },
    { hanzi: "摆", pinyin: "bǎi", meaning: "arranjar, balançar" },
    { hanzi: "排", pinyin: "pái", meaning: "arranjar, fila" },
    { hanzi: "列", pinyin: "liè", meaning: "lista, alinhar" },
    { hanzi: "序", pinyin: "xù", meaning: "ordem, sequência" },
    { hanzi: "次", pinyin: "cì", meaning: "vez, próximo" },
    { hanzi: "级", pinyin: "jí", meaning: "nível, classe" },
    { hanzi: "层", pinyin: "céng", meaning: "camada, andar" },
    { hanzi: "段", pinyin: "duàn", meaning: "seção, parágrafo" },
    { hanzi: "落", pinyin: "luò/là/lào", meaning: "cair, deixar cair" },
  ],
  hsk5: [
    { hanzi: "版", pinyin: "bǎn", meaning: "edição, placa" },
    { hanzi: "报", pinyin: "bào", meaning: "jornal, reportar" },
    { hanzi: "杂", pinyin: "zá", meaning: "misturado, variado" },
    { hanzi: "志", pinyin: "zhì", meaning: "revista, vontade" },
    { hanzi: "刊", pinyin: "kān", meaning: "publicação" },
    { hanzi: "登", pinyin: "dēng", meaning: "publicar, subir" },
    { hanzi: "载", pinyin: "zǎi/zài", meaning: "carregar, registrar" },
    { hanzi: "印", pinyin: "yìn", meaning: "imprimir, selo" },
    { hanzi: "刷", pinyin: "shuā/shuà", meaning: "escovar, imprimir" },
    { hanzi: "编", pinyin: "biān", meaning: "editar, compilar" },
    { hanzi: "译", pinyin: "yì", meaning: "traduzir" },
    { hanzi: "著", pinyin: "zhù/zhe/zhuó", meaning: "escrever, obra" },
    { hanzi: "述", pinyin: "shù", meaning: "declarar, narrativa" },
    { hanzi: "论", pinyin: "lùn", meaning: "teoria, discutir" },
    { hanzi: "议", pinyin: "yì", meaning: "discussão, proposta" },
    { hanzi: "评", pinyin: "píng", meaning: "criticar, avaliar" },
    { hanzi: "价", pinyin: "jià", meaning: "preço, valor" },
    { hanzi: "值", pinyin: "zhí", meaning: "valor" },
    { hanzi: "费", pinyin: "fèi", meaning: "taxa, gastar" },
    { hanzi: "花", pinyin: "huā", meaning: "flor, gastar" },
    { hanzi: "钱", pinyin: "qián", meaning: "dinheiro" },
    { hanzi: "币", pinyin: "bì", meaning: "moeda" },
    { hanzi: "元", pinyin: "yuán", meaning: "yuan, origem" },
    { hanzi: "块", pinyin: "kuài", meaning: "pedaço, yuan (coloquial)" },
    { hanzi: "角", pinyin: "jiǎo/jué", meaning: "chifre, 10 centavos" },
    { hanzi: "毛", pinyin: "máo", meaning: "pelo, 10 centavos" },
    { hanzi: "富", pinyin: "fù", meaning: "rico" },
    { hanzi: "贫", pinyin: "pín", meaning: "pobre" },
    { hanzi: "穷", pinyin: "qióng", meaning: "pobre" },
    { hanzi: "贵", pinyin: "guì", meaning: "caro, nobre" },
    { hanzi: "廉", pinyin: "lián", meaning: "barato, honesto" },
    { hanzi: "宜", pinyin: "yí", meaning: "apropriado, barato" },
    { hanzi: "赚", pinyin: "zhuàn", meaning: "ganhar dinheiro" },
    { hanzi: "挣", pinyin: "zhèng/zhēng", meaning: "ganhar, lutar" },
    { hanzi: "赔", pinyin: "péi", meaning: "compensar perda" },
    { hanzi: "亏", pinyin: "kuī", meaning: "perder, déficit" },
    { hanzi: "损", pinyin: "sǔn", meaning: "perder, danificar" },
    { hanzi: "失", pinyin: "shī", meaning: "perder" },
    { hanzi: "丢", pinyin: "diū", meaning: "perder, jogar fora" },
    { hanzi: "遗", pinyin: "yí", meaning: "deixar, legado" },
    { hanzi: "留", pinyin: "liú", meaning: "permanecer, deixar" },
    { hanzi: "存", pinyin: "cún", meaning: "existir, guardar" },
    { hanzi: "保", pinyin: "bǎo", meaning: "proteger, manter" },
    { hanzi: "护", pinyin: "hù", meaning: "proteger" },
    { hanzi: "守", pinyin: "shǒu", meaning: "guardar, defender" },
    { hanzi: "卫", pinyin: "wèi", meaning: "defender, guarda" },
    { hanzi: "防", pinyin: "fáng", meaning: "prevenir, defender" },
    { hanzi: "备", pinyin: "bèi", meaning: "preparar" },
    { hanzi: "预", pinyin: "yù", meaning: "prévio, antecipado" },
    { hanzi: "测", pinyin: "cè", meaning: "medir, prever" },
    { hanzi: "算", pinyin: "suàn", meaning: "calcular, considerar" },
    { hanzi: "数", pinyin: "shù/shǔ", meaning: "número, contar" },
    { hanzi: "计", pinyin: "jì", meaning: "calcular, plano" },
    { hanzi: "划", pinyin: "huà/huá", meaning: "plano, remar" },
    { hanzi: "案", pinyin: "àn", meaning: "caso, plano" },
    { hanzi: "略", pinyin: "lüè", meaning: "estratégia, resumo" },
    { hanzi: "策", pinyin: "cè", meaning: "estratégia, açoitar" },
    { hanzi: "谋", pinyin: "móu", meaning: "planejar, conspirar" },
    { hanzi: "虑", pinyin: "lǜ", meaning: "considerar, preocupar" },
  ],
  hsk6: [
    { hanzi: "哲", pinyin: "zhé", meaning: "filosofia, sábio" },
    { hanzi: "慧", pinyin: "huì", meaning: "sabedoria" },
    { hanzi: "智", pinyin: "zhì", meaning: "sabedoria, inteligência" },
    { hanzi: "愚", pinyin: "yú", meaning: "tolo" },
    { hanzi: "蠢", pinyin: "chǔn", meaning: "estúpido" },
    { hanzi: "聪", pinyin: "cōng", meaning: "inteligente, agudo" },
    { hanzi: "敏", pinyin: "mǐn", meaning: "ágil, sensível" },
    { hanzi: "钝", pinyin: "dùn", meaning: "embotado, lento" },
    { hanzi: "伶", pinyin: "líng", meaning: "esperto" },
    { hanzi: "俐", pinyin: "lì", meaning: "esperto, hábil" },
    { hanzi: "巧", pinyin: "qiǎo", meaning: "habilidoso, coincidência" },
    { hanzi: "拙", pinyin: "zhuō", meaning: "desajeitado" },
    { hanzi: "笨", pinyin: "bèn", meaning: "estúpido, pesado" },
    { hanzi: "呆", pinyin: "dāi", meaning: "tolo, ficar" },
    { hanzi: "傻", pinyin: "shǎ", meaning: "tolo, bobo" },
    { hanzi: "疯", pinyin: "fēng", meaning: "louco" },
    { hanzi: "狂", pinyin: "kuáng", meaning: "louco, fanático" },
    { hanzi: "癫", pinyin: "diān", meaning: "insano, epilepsia" },
    { hanzi: "痴", pinyin: "chī", meaning: "idiota, obcecado" },
    { hanzi: "迷", pinyin: "mí", meaning: "confuso, fã" },
    { hanzi: "惑", pinyin: "huò", meaning: "confuso, dúvida" },
    { hanzi: "糊", pinyin: "hú/hù", meaning: "confuso, pasta" },
    { hanzi: "涂", pinyin: "tú", meaning: "aplicar, sujar" },
    { hanzi: "抹", pinyin: "mǒ/mā/mò", meaning: "esfregar, apagar" },
    { hanzi: "擦", pinyin: "cā", meaning: "limpar, esfregar" },
    { hanzi: "刮", pinyin: "guā", meaning: "raspar, ventar" },
    { hanzi: "削", pinyin: "xuē/xiāo", meaning: "cortar, reduzir" },
    { hanzi: "割", pinyin: "gē", meaning: "cortar, colher" },
    { hanzi: "砍", pinyin: "kǎn", meaning: "cortar, picar" },
    { hanzi: "劈", pinyin: "pī/pǐ", meaning: "rachar, dividir" },
    { hanzi: "裂", pinyin: "liè", meaning: "rachadura, dividir" },
    { hanzi: "碎", pinyin: "suì", meaning: "quebrado, fragmentos" },
    { hanzi: "破", pinyin: "pò", meaning: "quebrado, romper" },
    { hanzi: "损", pinyin: "sǔn", meaning: "danificar" },
    { hanzi: "坏", pinyin: "huài", meaning: "ruim, estragado" },
    { hanzi: "烂", pinyin: "làn", meaning: "podre, em excesso" },
    { hanzi: "腐", pinyin: "fǔ", meaning: "podre, corrupto" },
    { hanzi: "朽", pinyin: "xiǔ", meaning: "podre, decadente" },
    { hanzi: "蚀", pinyin: "shí", meaning: "corroer" },
    { hanzi: "锈", pinyin: "xiù", meaning: "ferrugem" },
    { hanzi: "霉", pinyin: "méi", meaning: "mofo" },
    { hanzi: "臭", pinyin: "chòu/xiù", meaning: "fedorento" },
    { hanzi: "香", pinyin: "xiāng", meaning: "fragrante" },
    { hanzi: "芳", pinyin: "fāng", meaning: "fragrante" },
    { hanzi: "馨", pinyin: "xīn", meaning: "fragrante" },
    { hanzi: "芬", pinyin: "fēn", meaning: "fragrância" },
    { hanzi: "馥", pinyin: "fù", meaning: "fragrância rica" },
    { hanzi: "郁", pinyin: "yù", meaning: "luxuriante, deprimido" },
    { hanzi: "闷", pinyin: "mēn/mèn", meaning: "abafado, deprimido" },
    { hanzi: "沉", pinyin: "chén", meaning: "afundar, pesado" },
    { hanzi: "浮", pinyin: "fú", meaning: "flutuar" },
    { hanzi: "漂", pinyin: "piāo/piǎo/piào", meaning: "flutuar, bonito" },
    { hanzi: "泛", pinyin: "fàn", meaning: "flutuar, geral" },
    { hanzi: "溢", pinyin: "yì", meaning: "transbordar" },
    { hanzi: "洒", pinyin: "sǎ", meaning: "respingar, derramar" },
    { hanzi: "泼", pinyin: "pō", meaning: "respingar, vigoroso" },
    { hanzi: "喷", pinyin: "pēn/pèn", meaning: "pulverizar" },
    { hanzi: "洒", pinyin: "sǎ", meaning: "aspergir" },
    { hanzi: "淋", pinyin: "lín/lìn", meaning: "derramar, regar" },
  ],
  numbers: [
    { hanzi: "一", pinyin: "yī", meaning: "um" },
    { hanzi: "二", pinyin: "èr", meaning: "dois" },
    { hanzi: "三", pinyin: "sān", meaning: "três" },
    { hanzi: "四", pinyin: "sì", meaning: "quatro" },
    { hanzi: "五", pinyin: "wǔ", meaning: "cinco" },
    { hanzi: "六", pinyin: "liù", meaning: "seis" },
    { hanzi: "七", pinyin: "qī", meaning: "sete" },
    { hanzi: "八", pinyin: "bā", meaning: "oito" },
    { hanzi: "九", pinyin: "jiǔ", meaning: "nove" },
    { hanzi: "十", pinyin: "shí", meaning: "dez" },
    { hanzi: "百", pinyin: "bǎi", meaning: "cem" },
    { hanzi: "千", pinyin: "qiān", meaning: "mil" },
    { hanzi: "万", pinyin: "wàn", meaning: "dez mil" },
    { hanzi: "零", pinyin: "líng", meaning: "zero" },
    { hanzi: "两", pinyin: "liǎng", meaning: "dois (antes de medidas)" },
    { hanzi: "半", pinyin: "bàn", meaning: "metade" },
    { hanzi: "双", pinyin: "shuāng", meaning: "par" },
  ],
  colors: [
    { hanzi: "红", pinyin: "hóng", meaning: "vermelho" },
    { hanzi: "黄", pinyin: "huáng", meaning: "amarelo" },
    { hanzi: "蓝", pinyin: "lán", meaning: "azul" },
    { hanzi: "绿", pinyin: "lǜ", meaning: "verde" },
    { hanzi: "白", pinyin: "bái", meaning: "branco" },
    { hanzi: "黑", pinyin: "hēi", meaning: "preto" },
    { hanzi: "灰", pinyin: "huī", meaning: "cinza" },
    { hanzi: "紫", pinyin: "zǐ", meaning: "roxo" },
    { hanzi: "橙", pinyin: "chéng", meaning: "laranja" },
    { hanzi: "粉", pinyin: "fěn", meaning: "rosa" },
    { hanzi: "棕", pinyin: "zōng", meaning: "marrom" },
    { hanzi: "褐", pinyin: "hè", meaning: "marrom escuro" },
    { hanzi: "金", pinyin: "jīn", meaning: "dourado, ouro" },
    { hanzi: "银", pinyin: "yín", meaning: "prata, prateado" },
    { hanzi: "青", pinyin: "qīng", meaning: "azul-esverdeado" },
  ],
  family: [
    { hanzi: "爸", pinyin: "bà", meaning: "pai" },
    { hanzi: "妈", pinyin: "mā", meaning: "mãe" },
    { hanzi: "哥", pinyin: "gē", meaning: "irmão mais velho" },
    { hanzi: "姐", pinyin: "jiě", meaning: "irmã mais velha" },
    { hanzi: "弟", pinyin: "dì", meaning: "irmão mais novo" },
    { hanzi: "妹", pinyin: "mèi", meaning: "irmã mais nova" },
    { hanzi: "儿", pinyin: "ér", meaning: "filho" },
    { hanzi: "女", pinyin: "nǚ", meaning: "filha, mulher" },
    { hanzi: "孩", pinyin: "hái", meaning: "criança" },
    { hanzi: "祖", pinyin: "zǔ", meaning: "avô, ancestral" },
    { hanzi: "爷", pinyin: "yé", meaning: "avô paterno" },
    { hanzi: "奶", pinyin: "nǎi", meaning: "avó, leite" },
    { hanzi: "公", pinyin: "gōng", meaning: "público, sogro" },
    { hanzi: "婆", pinyin: "pó", meaning: "sogra, velha senhora" },
    { hanzi: "夫", pinyin: "fū", meaning: "marido" },
    { hanzi: "妻", pinyin: "qī", meaning: "esposa" },
    { hanzi: "叔", pinyin: "shū", meaning: "tio paterno mais novo" },
    { hanzi: "伯", pinyin: "bó", meaning: "tio paterno mais velho" },
    { hanzi: "姨", pinyin: "yí", meaning: "tia materna" },
    { hanzi: "姑", pinyin: "gū", meaning: "tia paterna" },
    { hanzi: "舅", pinyin: "jiù", meaning: "tio materno" },
    { hanzi: "侄", pinyin: "zhí", meaning: "sobrinho" },
    { hanzi: "甥", pinyin: "shēng", meaning: "sobrinho de irmã" },
    { hanzi: "孙", pinyin: "sūn", meaning: "neto" },
  ],
  food: [
    { hanzi: "饭", pinyin: "fàn", meaning: "arroz, comida" },
    { hanzi: "菜", pinyin: "cài", meaning: "vegetal, prato" },
    { hanzi: "肉", pinyin: "ròu", meaning: "carne" },
    { hanzi: "鱼", pinyin: "yú", meaning: "peixe" },
    { hanzi: "鸡", pinyin: "jī", meaning: "frango" },
    { hanzi: "蛋", pinyin: "dàn", meaning: "ovo" },
    { hanzi: "茶", pinyin: "chá", meaning: "chá" },
    { hanzi: "咖", pinyin: "kā", meaning: "café" },
    { hanzi: "啡", pinyin: "fēi", meaning: "café" },
    { hanzi: "奶", pinyin: "nǎi", meaning: "leite" },
    { hanzi: "果", pinyin: "guǒ", meaning: "fruta" },
    { hanzi: "汤", pinyin: "tāng", meaning: "sopa" },
    { hanzi: "面", pinyin: "miàn", meaning: "macarrão" },
    { hanzi: "包", pinyin: "bāo", meaning: "pão, embrulhar" },
    { hanzi: "酒", pinyin: "jiǔ", meaning: "álcool" },
    { hanzi: "糖", pinyin: "táng", meaning: "açúcar" },
    { hanzi: "盐", pinyin: "yán", meaning: "sal" },
    { hanzi: "醋", pinyin: "cù", meaning: "vinagre" },
    { hanzi: "油", pinyin: "yóu", meaning: "óleo" },
    { hanzi: "酱", pinyin: "jiàng", meaning: "molho" },
    { hanzi: "豆", pinyin: "dòu", meaning: "feijão" },
    { hanzi: "腐", pinyin: "fǔ", meaning: "tofu, podre" },
    { hanzi: "米", pinyin: "mǐ", meaning: "arroz (grão)" },
    { hanzi: "粉", pinyin: "fěn", meaning: "pó, macarrão de arroz" },
    { hanzi: "饺", pinyin: "jiǎo", meaning: "bolinho" },
    { hanzi: "馒", pinyin: "mán", meaning: "pãozinho cozido no vapor" },
    { hanzi: "头", pinyin: "tou", meaning: "cabeça (parte de 馒头)" },
    { hanzi: "饼", pinyin: "bǐng", meaning: "bolo achatado" },
    { hanzi: "糕", pinyin: "gāo", meaning: "bolo" },
    { hanzi: "粥", pinyin: "zhōu", meaning: "mingau" },
    { hanzi: "虾", pinyin: "xiā", meaning: "camarão" },
    { hanzi: "蟹", pinyin: "xiè", meaning: "caranguejo" },
    { hanzi: "贝", pinyin: "bèi", meaning: "marisco, concha" },
    { hanzi: "鸭", pinyin: "yā", meaning: "pato" },
    { hanzi: "鹅", pinyin: "é", meaning: "ganso" },
  ],
  animals: [
    { hanzi: "猫", pinyin: "māo", meaning: "gato" },
    { hanzi: "狗", pinyin: "gǒu", meaning: "cachorro" },
    { hanzi: "鸟", pinyin: "niǎo", meaning: "pássaro" },
    { hanzi: "马", pinyin: "mǎ", meaning: "cavalo" },
    { hanzi: "牛", pinyin: "niú", meaning: "vaca" },
    { hanzi: "羊", pinyin: "yáng", meaning: "ovelha" },
    { hanzi: "猪", pinyin: "zhū", meaning: "porco" },
    { hanzi: "虎", pinyin: "hǔ", meaning: "tigre" },
    { hanzi: "龙", pinyin: "lóng", meaning: "dragão" },
    { hanzi: "蛇", pinyin: "shé", meaning: "cobra" },
    { hanzi: "兔", pinyin: "tù", meaning: "coelho" },
    { hanzi: "鼠", pinyin: "shǔ", meaning: "rato" },
    { hanzi: "狼", pinyin: "láng", meaning: "lobo" },
    { hanzi: "熊", pinyin: "xióng", meaning: "urso" },
    { hanzi: "豹", pinyin: "bào", meaning: "leopardo" },
    { hanzi: "狮", pinyin: "shī", meaning: "leão" },
    { hanzi: "象", pinyin: "xiàng", meaning: "elefante" },
    { hanzi: "猴", pinyin: "hóu", meaning: "macaco" },
    { hanzi: "鹿", pinyin: "lù", meaning: "veado" },
    { hanzi: "鹰", pinyin: "yīng", meaning: "águia" },
    { hanzi: "鸽", pinyin: "gē", meaning: "pombo" },
    { hanzi: "鸡", pinyin: "jī", meaning: "galinha" },
    { hanzi: "鸭", pinyin: "yā", meaning: "pato" },
    { hanzi: "鹅", pinyin: "é", meaning: "ganso" },
    { hanzi: "蚁", pinyin: "yǐ", meaning: "formiga" },
    { hanzi: "蜂", pinyin: "fēng", meaning: "abelha" },
    { hanzi: "蝶", pinyin: "dié", meaning: "borboleta" },
    { hanzi: "蝴", pinyin: "hú", meaning: "borboleta (parte de 蝴蝶)" },
    { hanzi: "蜘", pinyin: "zhī", meaning: "aranha (parte de 蜘蛛)" },
    { hanzi: "蛛", pinyin: "zhū", meaning: "aranha" },
  ],
  verbs: [
    { hanzi: "跑", pinyin: "pǎo", meaning: "correr" },
    { hanzi: "跳", pinyin: "tiào", meaning: "pular" },
    { hanzi: "飞", pinyin: "fēi", meaning: "voar" },
    { hanzi: "游", pinyin: "yóu", meaning: "nadar, viajar" },
    { hanzi: "爬", pinyin: "pá", meaning: "escalar, rastejar" },
    { hanzi: "推", pinyin: "tuī", meaning: "empurrar" },
    { hanzi: "拉", pinyin: "lā", meaning: "puxar" },
    { hanzi: "扔", pinyin: "rēng", meaning: "jogar fora" },
    { hanzi: "丢", pinyin: "diū", meaning: "perder, jogar" },
    { hanzi: "捡", pinyin: "jiǎn", meaning: "pegar, coletar" },
    { hanzi: "抓", pinyin: "zhuā", meaning: "agarrar" },
    { hanzi: "握", pinyin: "wò", meaning: "segurar, apertar" },
    { hanzi: "抱", pinyin: "bào", meaning: "abraçar" },
    { hanzi: "摸", pinyin: "mō", meaning: "tocar, sentir" },
    { hanzi: "碰", pinyin: "pèng", meaning: "tocar, bater" },
    { hanzi: "撞", pinyin: "zhuàng", meaning: "colidir" },
    { hanzi: "打", pinyin: "dǎ", meaning: "bater, jogar" },
    { hanzi: "踢", pinyin: "tī", meaning: "chutar" },
    { hanzi: "扔", pinyin: "rēng", meaning: "jogar fora" },
    { hanzi: "投", pinyin: "tóu", meaning: "lançar, investir" },
    { hanzi: "掷", pinyin: "zhì", meaning: "arremessar" },
    { hanzi: "扔", pinyin: "rēng", meaning: "jogar fora" },
    { hanzi: "喊", pinyin: "hǎn", meaning: "gritar" },
    { hanzi: "叫", pinyin: "jiào", meaning: "chamar, gritar" },
    { hanzi: "哭", pinyin: "kū", meaning: "chorar" },
    { hanzi: "笑", pinyin: "xiào", meaning: "rir" },
    { hanzi: "唱", pinyin: "chàng", meaning: "cantar" },
    { hanzi: "跳", pinyin: "tiào", meaning: "dançar, pular" },
    { hanzi: "舞", pinyin: "wǔ", meaning: "dançar" },
    { hanzi: "演", pinyin: "yǎn", meaning: "atuar,演出" },
    { hanzi: "奏", pinyin: "zòu", meaning: "tocar música" },
    { hanzi: "弹", pinyin: "tán/dàn", meaning: "tocar (instrumento), bala" },
    { hanzi: "拉", pinyin: "lā", meaning: "tocar (violino)" },
    { hanzi: "吹", pinyin: "chuī", meaning: "soprar, tocar (flauta)" },
    { hanzi: "敲", pinyin: "qiāo", meaning: "bater, tocar (tambor)" },
  ],
  adjectives: [
    { hanzi: "大", pinyin: "dà", meaning: "grande" },
    { hanzi: "小", pinyin: "xiǎo", meaning: "pequeno" },
    { hanzi: "长", pinyin: "cháng", meaning: "longo" },
    { hanzi: "短", pinyin: "duǎn", meaning: "curto" },
    { hanzi: "高", pinyin: "gāo", meaning: "alto" },
    { hanzi: "低", pinyin: "dī", meaning: "baixo" },
    { hanzi: "厚", pinyin: "hòu", meaning: "grosso" },
    { hanzi: "薄", pinyin: "báo/bó", meaning: "fino" },
    { hanzi: "宽", pinyin: "kuān", meaning: "largo" },
    { hanzi: "窄", pinyin: "zhǎi", meaning: "estreito" },
    { hanzi: "深", pinyin: "shēn", meaning: "profundo" },
    { hanzi: "浅", pinyin: "qiǎn", meaning: "raso" },
    { hanzi: "重", pinyin: "zhòng", meaning: "pesado" },
    { hanzi: "轻", pinyin: "qīng", meaning: "leve" },
    { hanzi: "快", pinyin: "kuài", meaning: "rápido" },
    { hanzi: "慢", pinyin: "màn", meaning: "lento" },
    { hanzi: "早", pinyin: "zǎo", meaning: "cedo" },
    { hanzi: "晚", pinyin: "wǎn", meaning: "tarde" },
    { hanzi: "热", pinyin: "rè", meaning: "quente" },
    { hanzi: "冷", pinyin: "lěng", meaning: "frio" },
    { hanzi: "暖", pinyin: "nuǎn", meaning: "morno" },
    { hanzi: "凉", pinyin: "liáng/liàng", meaning: "fresco" },
    { hanzi: "干", pinyin: "gān/gàn", meaning: "seco, fazer" },
    { hanzi: "湿", pinyin: "shī", meaning: "úmido" },
    { hanzi: "亮", pinyin: "liàng", meaning: "brilhante" },
    { hanzi: "暗", pinyin: "àn", meaning: "escuro" },
    { hanzi: "明", pinyin: "míng", meaning: "brilhante, claro" },
    { hanzi: "亮", pinyin: "liàng", meaning: "luminoso" },
    { hanzi: "净", pinyin: "jìng", meaning: "limpo" },
    { hanzi: "脏", pinyin: "zāng", meaning: "sujo" },
    { hanzi: "新", pinyin: "xīn", meaning: "novo" },
    { hanzi: "旧", pinyin: "jiù", meaning: "velho" },
    { hanzi: "软", pinyin: "ruǎn", meaning: "macio" },
    { hanzi: "硬", pinyin: "yìng", meaning: "duro" },
    { hanzi: "滑", pinyin: "huá", meaning: "escorregadio" },
    { hanzi: "粗", pinyin: "cū", meaning: "grosso, áspero" },
    { hanzi: "细", pinyin: "xì", meaning: "fino, detalhado" },
    { hanzi: "甜", pinyin: "tián", meaning: "doce" },
    { hanzi: "苦", pinyin: "kǔ", meaning: "amargo" },
    { hanzi: "酸", pinyin: "suān", meaning: "azedo" },
    { hanzi: "辣", pinyin: "là", meaning: "picante" },
    { hanzi: "咸", pinyin: "xián", meaning: "salgado" },
    { hanzi: "淡", pinyin: "dàn", meaning: "sem gosto, leve" },
    { hanzi: "香", pinyin: "xiāng", meaning: "fragrante" },
    { hanzi: "臭", pinyin: "chòu", meaning: "fedorento" },
  ],
  places: [
    { hanzi: "城", pinyin: "chéng", meaning: "cidade" },
    { hanzi: "市", pinyin: "shì", meaning: "cidade, mercado" },
    { hanzi: "镇", pinyin: "zhèn", meaning: "cidade pequena" },
    { hanzi: "村", pinyin: "cūn", meaning: "vila" },
    { hanzi: "店", pinyin: "diàn", meaning: "loja" },
    { hanzi: "馆", pinyin: "guǎn", meaning: "edifício público" },
    { hanzi: "场", pinyin: "chǎng", meaning: "campo, local" },
    { hanzi: "院", pinyin: "yuàn", meaning: "pátio, instituição" },
    { hanzi: "楼", pinyin: "lóu", meaning: "edifício" },
    { hanzi: "房", pinyin: "fáng", meaning: "quarto, casa" },
    { hanzi: "室", pinyin: "shì", meaning: "quarto" },
    { hanzi: "厅", pinyin: "tīng", meaning: "sala" },
    { hanzi: "堂", pinyin: "táng", meaning: "salão" },
    { hanzi: "屋", pinyin: "wū", meaning: "casa, quarto" },
    { hanzi: "桥", pinyin: "qiáo", meaning: "ponte" },
    { hanzi: "塔", pinyin: "tǎ", meaning: "torre, pagode" },
    { hanzi: "墙", pinyin: "qiáng", meaning: "parede" },
    { hanzi: "窗", pinyin: "chuāng", meaning: "janela" },
    { hanzi: "园", pinyin: "yuán", meaning: "jardim, parque" },
    { hanzi: "林", pinyin: "lín", meaning: "floresta" },
    { hanzi: "森", pinyin: "sēn", meaning: "floresta densa" },
    { hanzi: "山", pinyin: "shān", meaning: "montanha" },
    { hanzi: "河", pinyin: "hé", meaning: "rio" },
    { hanzi: "江", pinyin: "jiāng", meaning: "rio (grande)" },
    { hanzi: "海", pinyin: "hǎi", meaning: "mar" },
    { hanzi: "湖", pinyin: "hú", meaning: "lago" },
    { hanzi: "池", pinyin: "chí", meaning: "lago, piscina" },
    { hanzi: "岛", pinyin: "dǎo", meaning: "ilha" },
    { hanzi: "洲", pinyin: "zhōu", meaning: "continente" },
    { hanzi: "洋", pinyin: "yáng", meaning: "oceano" },
    { hanzi: "滩", pinyin: "tān", meaning: "praia, banco de areia" },
    { hanzi: "港", pinyin: "gǎng", meaning: "porto" },
    { hanzi: "湾", pinyin: "wān", meaning: "baía" },
  ],
  professions: [
    { hanzi: "师", pinyin: "shī", meaning: "professor, mestre" },
    { hanzi: "生", pinyin: "shēng", meaning: "estudante, vida" },
    { hanzi: "医", pinyin: "yī", meaning: "médico, medicina" },
    { hanzi: "护", pinyin: "hù", meaning: "enfermeiro, proteger" },
    { hanzi: "士", pinyin: "shì", meaning: "soldado, estudioso" },
    { hanzi: "工", pinyin: "gōng", meaning: "trabalhador" },
    { hanzi: "农", pinyin: "nóng", meaning: "agricultor" },
    { hanzi: "商", pinyin: "shāng", meaning: "comerciante" },
    { hanzi: "兵", pinyin: "bīng", meaning: "soldado" },
    { hanzi: "警", pinyin: "jǐng", meaning: "polícia, alertar" },
    { hanzi: "官", pinyin: "guān", meaning: "oficial" },
    { hanzi: "员", pinyin: "yuán", meaning: "membro, funcionário" },
    { hanzi: "长", pinyin: "zhǎng", meaning: "chefe, crescer" },
    { hanzi: "理", pinyin: "lǐ", meaning: "gerente, razão" },
    { hanzi: "导", pinyin: "dǎo", meaning: "guia, diretor" },
    { hanzi: "演", pinyin: "yǎn", meaning: "ator,演出" },
    { hanzi: "唱", pinyin: "chàng", meaning: "cantor" },
    { hanzi: "画", pinyin: "huà", meaning: "pintor, desenhar" },
    { hanzi: "写", pinyin: "xiě", meaning: "escritor" },
    { hanzi: "记", pinyin: "jì", meaning: "repórter, anotar" },
    { hanzi: "厨", pinyin: "chú", meaning: "cozinheiro, cozinha" },
    { hanzi: "司", pinyin: "sī", meaning: "motorista, departamento" },
    { hanzi: "机", pinyin: "jī", meaning: "piloto, máquina" },
    { hanzi: "售", pinyin: "shòu", meaning: "vendedor" },
    { hanzi: "务", pinyin: "wù", meaning: "garçom, assunto" },
  ],
  time: [
    { hanzi: "今", pinyin: "jīn", meaning: "hoje, agora" },
    { hanzi: "昨", pinyin: "zuó", meaning: "ontem" },
    { hanzi: "明", pinyin: "míng", meaning: "amanhã, brilhante" },
    { hanzi: "早", pinyin: "zǎo", meaning: "manhã, cedo" },
    { hanzi: "晚", pinyin: "wǎn", meaning: "noite, tarde" },
    { hanzi: "午", pinyin: "wǔ", meaning: "meio-dia" },
    { hanzi: "夜", pinyin: "yè", meaning: "noite" },
    { hanzi: "晨", pinyin: "chén", meaning: "manhã" },
    { hanzi: "暮", pinyin: "mù", meaning: "entardecer" },
    { hanzi: "昼", pinyin: "zhòu", meaning: "dia" },
    { hanzi: "刻", pinyin: "kè", meaning: "quarto de hora" },
    { hanzi: "钟", pinyin: "zhōng", meaning: "relógio, sino" },
    { hanzi: "秒", pinyin: "miǎo", meaning: "segundo" },
    { hanzi: "周", pinyin: "zhōu", meaning: "semana" },
    { hanzi: "季", pinyin: "jì", meaning: "estação, trimestre" },
    { hanzi: "春", pinyin: "chūn", meaning: "primavera" },
    { hanzi: "夏", pinyin: "xià", meaning: "verão" },
    { hanzi: "秋", pinyin: "qiū", meaning: "outono" },
    { hanzi: "冬", pinyin: "dōng", meaning: "inverno" },
    { hanzi: "节", pinyin: "jié", meaning: "festival, nó" },
    { hanzi: "假", pinyin: "jià", meaning: "feriado, férias" },
    { hanzi: "期", pinyin: "qī", meaning: "período" },
    { hanzi: "段", pinyin: "duàn", meaning: "seção, período" },
    { hanzi: "际", pinyin: "jì", meaning: "ocasião, internacional" },
  ],
  weather: [
    { hanzi: "天", pinyin: "tiān", meaning: "céu, clima" },
    { hanzi: "气", pinyin: "qì", meaning: "ar, clima" },
    { hanzi: "候", pinyin: "hòu", meaning: "clima, aguardar" },
    { hanzi: "晴", pinyin: "qíng", meaning: "ensolarado" },
    { hanzi: "阴", pinyin: "yīn", meaning: "nublado, sombrio" },
    { hanzi: "云", pinyin: "yún", meaning: "nuvem" },
    { hanzi: "雨", pinyin: "yǔ", meaning: "chuva" },
    { hanzi: "雪", pinyin: "xuě", meaning: "neve" },
    { hanzi: "风", pinyin: "fēng", meaning: "vento" },
    { hanzi: "雷", pinyin: "léi", meaning: "trovão" },
    { hanzi: "电", pinyin: "diàn", meaning: "relâmpago, eletricidade" },
    { hanzi: "雾", pinyin: "wù", meaning: "neblina" },
    { hanzi: "霜", pinyin: "shuāng", meaning: "geada" },
    { hanzi: "冰", pinyin: "bīng", meaning: "gelo" },
    { hanzi: "霞", pinyin: "xiá", meaning: "brilho do sol" },
    { hanzi: "虹", pinyin: "hóng", meaning: "arco-íris" },
    { hanzi: "温", pinyin: "wēn", meaning: "temperatura, morno" },
    { hanzi: "度", pinyin: "dù", meaning: "grau, medida" },
  ],
}

interface HanziCatalogProps {
  flashcards?: any[]
  onAddCards: (cards: any[]) => void
  onClose: () => void
  existingFlashcards: any[]
  onRemoveCard?: (hanzi: string) => void
  onRemoveFlashcard?: (hanzi: string) => void
}

export function HanziCatalog({
  flashcards = [],
  onAddCards,
  onClose,
  existingFlashcards,
  onRemoveCard,
  onRemoveFlashcard,
}: HanziCatalogProps) {
  const [selectedCards, setSelectedCards] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("aulas")
  const [snackbar, setSnackbar] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  })
  const [showSnackbar, setShowSnackbar] = useState(false) // From updates

  const [customCategories, setCustomCategories] = useState<
    { id: string; name: string; cards: any[] }[]
  >([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categorySelection, setCategorySelection] = useState<any[]>([])
  const [categoryModalSearch, setCategoryModalSearch] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("customHanziCategories")
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved))
      } catch {
        // ignore corrupted data
      }
    }
  }, [])

  const persistCustomCategories = (categories: { id: string; name: string; cards: any[] }[]) => {
    setCustomCategories(categories)
    localStorage.setItem("customHanziCategories", JSON.stringify(categories))
  }

  // Unique list of every character in the built-in catalog, used to pick cards for a custom category
  const allCatalogCards = useMemo(() => {
    const map = new Map<string, any>()
    Object.values(HANZI_CATALOG)
      .flat()
      .forEach((card) => {
        if (!map.has(card.hanzi)) map.set(card.hanzi, card)
      })
    return Array.from(map.values())
  }, [])

  const openCategoryModal = () => {
    setNewCategoryName("")
    setCategorySelection([])
    setCategoryModalSearch("")
    setShowCategoryModal(true)
  }

  const toggleCategorySelection = (card: any) => {
    setCategorySelection((prev) =>
      prev.some((c) => c.hanzi === card.hanzi)
        ? prev.filter((c) => c.hanzi !== card.hanzi)
        : [...prev, card],
    )
  }

  const handleCreateCategory = () => {
    const name = newCategoryName.trim()
    if (!name || categorySelection.length === 0) return
    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      cards: categorySelection,
    }
    persistCustomCategories([...customCategories, newCategory])
    setShowCategoryModal(false)
    setActiveTab(`custom-${newCategory.id}`)
  }

  const handleDeleteCategory = (id: string) => {
    const remaining = customCategories.filter((c) => c.id !== id)
    persistCustomCategories(remaining)
    setCategoryToDelete(null)
    if (activeTab === `custom-${id}`) {
      setActiveTab("aulas")
    }
  }

  const filteredCategoryModalCards = useMemo(() => {
    if (!categoryModalSearch) return allCatalogCards
    const term = categoryModalSearch.toLowerCase()
    return allCatalogCards.filter(
      (card) =>
        card.hanzi.includes(categoryModalSearch) ||
        card.pinyin.toLowerCase().includes(term) ||
        card.meaning.toLowerCase().includes(term),
    )
  }, [allCatalogCards, categoryModalSearch])

  const isAlreadyAdded = (hanzi: string) => {
    // Use existingFlashcards if onRemoveCard is provided, otherwise check against flashcards (from updates)
    const cardsToCheck = onRemoveCard ? existingFlashcards : flashcards
    return cardsToCheck.some((card) => card.hanzi === hanzi)
  }

  const toggleCard = (card: any) => {
    if (isAlreadyAdded(card.hanzi)) {
      // Prioritize onRemoveFlashcard from updates if it exists, otherwise use onRemoveCard
      if (onRemoveFlashcard) {
        onRemoveFlashcard(card.hanzi)
      } else if (onRemoveCard) {
        onRemoveCard(card.hanzi)
      }
      return
    }

    const isSelected = selectedCards.some((c) => c.hanzi === card.hanzi)
    if (isSelected) {
      setSelectedCards(selectedCards.filter((c) => c.hanzi !== card.hanzi))
    } else {
      setSelectedCards([...selectedCards, card])
    }
  }

  const addAllCards = (categoryCards: any[]) => {
    const newCards = categoryCards.filter(
      (card) => !selectedCards.some((c) => c.hanzi === card.hanzi) && !isAlreadyAdded(card.hanzi),
    )
    setSelectedCards([...selectedCards, ...newCards])
  }

  const addAllFromCategory = (category: string) => {
    addAllCards(HANZI_CATALOG[category as keyof typeof HANZI_CATALOG])
  }

  // Renamed from handleAddCards to handleAddToFlashcards based on updates
  const handleAddToFlashcards = () => {
    if (selectedCards.length > 0) {
      onAddCards(selectedCards)
      setSnackbar({
        message: `${selectedCards.length} flashcard${selectedCards.length > 1 ? "s" : ""} adicionado${selectedCards.length > 1 ? "s" : ""} com sucesso!`,
        visible: true,
      })
      setShowSnackbar(true) // From updates
      setSelectedCards([])
      // Hide snackbar after 3 seconds
      setTimeout(() => {
        setSnackbar({ message: "", visible: false })
        setShowSnackbar(false) // From updates
      }, 3000)
    }
  }

  const filterCards = (cards: any[]) => {
    if (!searchTerm) return cards
    return cards.filter(
      (card) =>
        card.hanzi.includes(searchTerm) ||
        card.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const renderCardGrid = (cards: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {filterCards(cards).map((card) => {
        const isSelected = selectedCards.some((c) => c.hanzi === card.hanzi)
        const alreadyAdded = isAlreadyAdded(card.hanzi)
        return (
          <button
            key={card.hanzi}
            onClick={() => toggleCard(card)}
            className={`
              group relative p-4 border-2 rounded-lg transition-all hover:shadow-lg
              ${
                alreadyAdded
                  ? "border-green-500 bg-green-500/20 shadow-md hover:border-red-500 hover:bg-red-500/20"
                  : isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
              }
            `}
          >
            <div
              className={`absolute top-1 right-1 rounded-full p-1 transition-colors ${
                alreadyAdded ? "bg-green-500 text-white group-hover:bg-red-500" : "opacity-0"
              }`}
            >
              <Check className="h-3 w-3 group-hover:hidden" />
              <X className="h-3 w-3 hidden group-hover:block" />
            </div>
            <div className="text-4xl mb-2 text-center">{card.hanzi}</div>
            <div className="text-sm text-muted-foreground text-center">{card.pinyin}</div>
            <div className="text-xs text-muted-foreground text-center mt-1 text-balance">{card.meaning}</div>
            {alreadyAdded && (
              <div className="text-xs text-green-600 dark:text-green-400 group-hover:text-red-600 dark:group-hover:text-red-400 font-semibold text-center mt-2 transition-colors">
                <span className="group-hover:hidden">Adicionado</span>
                <span className="hidden group-hover:inline">Clique para remover</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Snackbar - merged from both existing and updates */}
      {snackbar.visible && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
      {showSnackbar && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {selectedCards.length} hanzi{selectedCards.length !== 1 ? "s" : ""} adicionado
          {selectedCards.length !== 1 ? "s" : ""} aos flashcards!
        </div>
      )}

      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onClose}>
              {" "}
              {/* Changed from onBack to onClose based on updates */}
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedCards.length} selecionados
            </Badge>
            <Button onClick={handleAddToFlashcards} disabled={selectedCards.length === 0}>
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por hanzi, pinyin ou significado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters - Left side */}
            <div className="lg:w-64 order-1 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-lg font-semibold mb-3 hidden lg:block">Categorias</h3> {/* Added hidden lg:block */}
                {/* Mobile carousel - Added from updates */}
                <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
                  <TabsList className="inline-flex h-auto w-auto gap-2 bg-transparent">
                    <TabsTrigger value="aulas" className="whitespace-nowrap">
                      Aulas
                    </TabsTrigger>
                    <TabsTrigger value="licao3" className="whitespace-nowrap">
                      Lição 3
                    </TabsTrigger>
                    <TabsTrigger value="licao4" className="whitespace-nowrap">
                      Lição 4
                    </TabsTrigger>
                    <TabsTrigger value="licao5" className="whitespace-nowrap">
                      Lição 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk1" className="whitespace-nowrap">
                      HSK 1
                    </TabsTrigger>
                    <TabsTrigger value="hsk2" className="whitespace-nowrap">
                      HSK 2
                    </TabsTrigger>
                    <TabsTrigger value="hsk3" className="whitespace-nowrap">
                      HSK 3
                    </TabsTrigger>
                    <TabsTrigger value="hsk4" className="whitespace-nowrap">
                      HSK 4
                    </TabsTrigger>
                    <TabsTrigger value="hsk5" className="whitespace-nowrap">
                      HSK 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk6" className="whitespace-nowrap">
                      HSK 6
                    </TabsTrigger>
                    <TabsTrigger value="numbers" className="whitespace-nowrap">
                      Números
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="whitespace-nowrap">
                      Cores
                    </TabsTrigger>
                    <TabsTrigger value="family" className="whitespace-nowrap">
                      Família
                    </TabsTrigger>
                    <TabsTrigger value="food" className="whitespace-nowrap">
                      Comida
                    </TabsTrigger>
                    <TabsTrigger value="animals" className="whitespace-nowrap">
                      Animais
                    </TabsTrigger>
                    <TabsTrigger value="verbs" className="whitespace-nowrap">
                      Verbos
                    </TabsTrigger>
                    <TabsTrigger value="adjectives" className="whitespace-nowrap">
                      Adjetivos
                    </TabsTrigger>
                    <TabsTrigger value="places" className="whitespace-nowrap">
                      Lugares
                    </TabsTrigger>
                    <TabsTrigger value="professions" className="whitespace-nowrap">
                      Profissões
                    </TabsTrigger>
                    <TabsTrigger value="time" className="whitespace-nowrap">
                      Tempo
                    </TabsTrigger>
                    <TabsTrigger value="weather" className="whitespace-nowrap">
                      Clima
                    </TabsTrigger>
                    {customCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={`custom-${category.id}`}
                        className="whitespace-nowrap gap-1.5"
                      >
                        <Star className="h-3.5 w-3.5" />
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {/* Create category button - mobile */}
                <div className="lg:hidden mb-2">
                  <Button variant="outline" size="sm" onClick={openCategoryModal} className="bg-transparent">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Categoria
                  </Button>
                </div>
                {/* Desktop sidebar - modified from existing */}
                <TabsList className="hidden lg:flex flex-col h-auto w-full gap-1">
                  <TabsTrigger value="aulas" className="w-full justify-start">
                    Aulas
                  </TabsTrigger>
                  <TabsTrigger value="licao3" className="w-full justify-start">
                    Lição 3
                  </TabsTrigger>
                  <TabsTrigger value="licao4" className="w-full justify-start">
                    Lição 4
                  </TabsTrigger>
                  <TabsTrigger value="licao5" className="w-full justify-start">
                    Lição 5
                  </TabsTrigger>
                  <TabsTrigger value="hsk1" className="w-full justify-start">
                    HSK 1
                  </TabsTrigger>
                  <TabsTrigger value="hsk2" className="w-full justify-start">
                    HSK 2
                  </TabsTrigger>
                  <TabsTrigger value="hsk3" className="w-full justify-start">
                    HSK 3
                  </TabsTrigger>
                  <TabsTrigger value="hsk4" className="w-full justify-start">
                    HSK 4
                  </TabsTrigger>
                  <TabsTrigger value="hsk5" className="w-full justify-start">
                    HSK 5
                  </TabsTrigger>
                  <TabsTrigger value="hsk6" className="w-full justify-start">
                    HSK 6
                  </TabsTrigger>
                  <TabsTrigger value="numbers" className="w-full justify-start">
                    Números
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="w-full justify-start">
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="family" className="w-full justify-start">
                    Família
                  </TabsTrigger>
                  <TabsTrigger value="food" className="w-full justify-start">
                    Comida
                  </TabsTrigger>
                  <TabsTrigger value="animals" className="w-full justify-start">
                    Animais
                  </TabsTrigger>
                  <TabsTrigger value="verbs" className="w-full justify-start">
                    Verbos
                  </TabsTrigger>
                  <TabsTrigger value="adjectives" className="w-full justify-start">
                    Adjetivos
                  </TabsTrigger>
                  <TabsTrigger value="places" className="w-full justify-start">
                    Lugares
                  </TabsTrigger>
                  <TabsTrigger value="professions" className="w-full justify-start">
                    Profissões
                  </TabsTrigger>
                  <TabsTrigger value="time" className="w-full justify-start">
                    Tempo
                  </TabsTrigger>
                  <TabsTrigger value="weather" className="w-full justify-start">
                    Clima
                  </TabsTrigger>
                </TabsList>

                {/* Custom categories - desktop */}
                <div className="hidden lg:block mt-6">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Star className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Minhas Categorias
                    </h3>
                  </div>
                  {customCategories.length > 0 ? (
                    <TabsList className="flex flex-col h-auto w-full gap-1 bg-transparent p-0">
                      {customCategories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={`custom-${category.id}`}
                          className="w-full justify-start gap-2"
                        >
                          <Star className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  ) : (
                    <p className="text-xs text-muted-foreground px-1 mb-2">
                      Nenhuma categoria criada ainda.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCategoryModal}
                    className="w-full justify-start mt-2 bg-transparent"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Categoria
                  </Button>
                </div>
              </div>
            </div>

            {/* Hanzis Grid - Right side */}
            <div className="flex-1 order-2 lg:order-2">
              {Object.entries(HANZI_CATALOG).map(([category, cards]) => (
                <TabsContent key={category} value={category} className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold capitalize">
                      {category === "aulas" && "Aulas"}
                      {category === "licao3" && "Lição 3 — 第三课"}
                      {category === "licao4" && "Lição 4 — 第四课"}
                      {category === "licao5" && "Lição 5 — 第五课"}
                      {category === "hsk1" && "HSK Nível 1"}
                      {category === "hsk2" && "HSK Nível 2"}
                      {category === "hsk3" && "HSK Nível 3"}
                      {category === "hsk4" && "HSK Nível 4"}
                      {category === "hsk5" && "HSK Nível 5"}
                      {category === "hsk6" && "HSK Nível 6"}
                      {category === "numbers" && "Números"}
                      {category === "colors" && "Cores"}
                      {category === "family" && "Família"}
                      {category === "food" && "Comida"}
                      {category === "animals" && "Animais"}
                      {category === "verbs" && "Verbos Comuns"}
                      {category === "adjectives" && "Adjetivos"}
                      {category === "places" && "Lugares"}
                      {category === "professions" && "Profissões"}
                      {category === "time" && "Tempo"}
                      {category === "weather" && "Clima"}
                    </h2>
                    <Button variant="outline" onClick={() => addAllFromCategory(category)}>
                      Adicionar Todos
                    </Button>
                  </div>

                  {renderCardGrid(cards)}
                </TabsContent>
              ))}

              {/* Custom categories content */}
              {customCategories.map((category) => (
                <TabsContent key={category.id} value={`custom-${category.id}`} className="space-y-4 mt-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="h-5 w-5 text-primary shrink-0" />
                      <h2 className="text-2xl font-bold truncate">{category.name}</h2>
                      <Badge variant="secondary" className="shrink-0">
                        {category.cards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" onClick={() => addAllCards(category.cards)}>
                        Adicionar Todos
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCategoryToDelete({ id: category.id, name: category.name })}
                        aria-label={`Excluir categoria ${category.name}`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {renderCardGrid(category.cards)}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </main>

      {/* Floating action button for mobile - Added from updates */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={handleAddToFlashcards}
          disabled={selectedCards.length === 0}
          className="h-14 px-6 rounded-full shadow-lg disabled:opacity-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar ({selectedCards.length})
        </Button>
      </div>

      {/* Create custom category modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Nova Categoria</h3>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <label className="text-sm font-medium mb-1.5 block" htmlFor="category-name">
                Nome da categoria
              </label>
              <Input
                id="category-name"
                placeholder="Ex.: Meu vocabulário, Revisão da prova..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mb-4"
              />
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" htmlFor="category-search">
                  Selecione os caracteres
                </label>
                <Badge variant="secondary">{categorySelection.length} selecionados</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="category-search"
                  placeholder="Buscar por hanzi, pinyin ou significado..."
                  value={categoryModalSearch}
                  onChange={(e) => setCategoryModalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredCategoryModalCards.map((card) => {
                  const isSelected = categorySelection.some((c) => c.hanzi === card.hanzi)
                  return (
                    <button
                      key={card.hanzi}
                      onClick={() => toggleCategorySelection(card)}
                      className={`relative p-2 border-2 rounded-lg transition-all text-center ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="text-2xl">{card.hanzi}</div>
                      <div className="text-xs text-muted-foreground truncate">{card.pinyin}</div>
                    </button>
                  )
                })}
              </div>
              {filteredCategoryModalCards.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhum caractere encontrado para a busca.
                </p>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || categorySelection.length === 0}
                className="flex-1"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Criar Categoria
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete custom category confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4">Excluir Categoria</h3>
            <p className="text-muted-foreground mb-2">
              Tem certeza que deseja excluir a categoria &quot;{categoryToDelete.name}&quot;?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Os flashcards já adicionados aos seus estudos não serão removidos.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCategoryToDelete(null)} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteCategory(categoryToDelete.id)} className="flex-1">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
