<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'

// 类型定义
interface IPLocation {
	ip: string
	beginip: string
	endip: string
	region: string
	isp: string
	asn: string
	llc: string
	latitude: number
	longitude: number
}

// 常量配置
const CACHE_KEY = 'visitor_region_info_cache'
const CACHE_DURATION = 10 * 60  * 1000
const API_URL = 'https://uapis.cn/api/v1/network/myip'
const REFERENCE_LNG = 120.3074357
const REFERENCE_LAT = 31.4933074
const EARTH_RADIUS = 6371
const DEFAULT_WELCOME_TEXT = '欢迎客官来到本站'

// 欢迎语映射数据
const provinceWelcomeMap: Record<string, string> = {
	北京市: '北——京——欢迎你~~~',
	天津市: '讲段相声吧',
	河北: '燕赵大地，英雄辈出的河北，等你探索！',
	山西: '展开坐具长三尺，已占山河五百余',
	内蒙古自治区: '草原辽阔的内蒙古，等你来策马奔腾。',
	辽宁: '我想吃烤鸡架！',
	吉林: '状元阁就是东北烧烤之王',
	黑龙江: '很喜欢哈尔滨大剧院',
	上海市: '走在外滩，感受历史与现代的交融。',
	江苏: '水乡泽国，江南佳丽地。',
	浙江: '这里是浙江，充满江南的韵味！',
	河南: '这里是河南，历史悠久文化灿烂。',
	安徽: '安徽山水，黄山、九华山欢迎你。',
	福建: '福建山水如画，美景无处不在。',
	江西: '落霞与孤鹜齐飞，秋水共长天一色',
	山东: '山东好客，欢迎来感受齐鲁文化！',
	湖北: '湖北，长江中游的明珠，风景秀丽。',
	湖南: '湖南，烟雨迷蒙的湘江流过这片土地。',
	广东: '带你感受广东的热情与美食！',
	广西壮族自治区: '广西山清水秀，民俗风情浓郁。',
	海南: '阳光、沙滩、椰风海韵，欢迎来海南度假。',
	四川: '来四川，品麻辣火锅，赏壮丽山河。',
	贵州: '来贵州，品茅台，赏黄果树瀑布。',
	云南: '云南风景独特，风情万种。',
	西藏自治区: '西藏，神秘而纯净，等待你的探索。',
	陕西: '陕西，历史与文化的交汇之地。',
	甘肃: '甘肃，丝绸之路的重要节点。',
	青海: '青海，湖泊与草原的美丽结合。',
	宁夏回族自治区: '宁夏，塞上江南，黄河流经的美丽地方。',
	新疆维吾尔自治区: '新疆的城市各具特色，等待你的探索。',
	台湾: '我在这头，大陆在那头',
	香港特别行政区: '永定贼有残留地鬼嚎，迎击光非岁玉',
	澳门特别行政区: '性感荷官，在线发牌',
}

// 城市特定欢迎语映射
const cityWelcomeMap: Record<string, Record<string, string>> = {
	北京市: {
		北京市: '北——京——欢迎你~~~',
	},
	上海市: {
		上海市: '走在外滩，感受历史与现代的交融。',
	},
	广东: {
		广州市: '看小蛮腰，喝早茶了嘛~',
		深圳市: '今天你逛商场了嘛~',
		珠海市: '浪漫之城珠海，海风轻拂。',
		东莞市: '东莞，制造业之都，经济活跃。',
		佛山市: '佛山，武术之乡，陶瓷文化深厚。',
	},
	浙江: {
		杭州市: '西湖美景，三月天~',
		宁波市: '来宁波，感受大海的气息。',
		温州市: '温州人杰地灵，商贸繁荣。',
		绍兴市: '绍兴，酒乡文化，古韵悠长。',
		湖州市: '湖州，太湖之滨，风景如画。',
	},
	四川: {
		成都市: '宽窄巷子，成都慢生活。',
		绵阳市: '享受科技城的宁静与创新。',
		自贡市: '自贡的盐文化与灯会，独具魅力。',
		德阳市: '德阳，历史悠久，文化底蕴深厚。',
		乐山市: '乐山大佛，世界文化遗产。',
	},
	福建: {
		厦门市: '鼓浪屿听海，厦门美食让人流连忘返。',
		福州市: '有福之州，来此感受千年古城。',
		泉州市: '泉州，海上丝绸之路的起点。',
		漳州市: '漳州，古城文化与美食的结合。',
		南平市: '南平，武夷山的自然风光。',
	},
	山东: {
		青岛市: '来青岛喝啤酒，看大海吧！',
		济南市: '泉城济南，四面荷花三面柳。',
		烟台市: '烟台的葡萄酒与海鲜，令人陶醉。',
		潍坊市: '潍坊，风筝之都，文化底蕴深厚。',
		德州市: '德州，扒鸡闻名，文化悠久。',
	},
	江苏: {
		南京市: '六朝古都南京，历史与现代的碰撞。',
		苏州市: '来苏州，感受园林之美。',
		无锡市: '无锡太湖美景，灵山大佛令人心旷神怡。',
		常州市: '常州，文化与科技的交汇点。',
		南通市: '南通，海门潮涌，文化底蕴深厚。',
	},
	河北: {
		石家庄市: '燕赵大地，英雄辈出的河北，等你探索！',
	},
	河南: {
		郑州市: '中原大地，郑州是交通枢纽与历史重镇。',
		洛阳市: '千年古都洛阳，牡丹花开的城。',
		开封市: '开封，古都文化与美食的汇聚地。',
		新乡市: '新乡，历史悠久，文化底蕴深厚。',
		焦作市: '焦作，云台山的自然风光。',
	},
	湖南: {
		长沙市: '热辣长沙，吃小龙虾逛黄兴路步行街。',
		岳阳市: '岳阳楼，洞庭湖的美景尽收眼底。',
		株洲市: '株洲，火车制造业的发源地。',
		湘潭市: '湘潭，伟人故里，文化底蕴深厚。',
	},
	湖北: {
		武汉市: '来大武汉，过长江大桥，吃热干面！',
		宜昌市: '三峡大坝，壮丽的自然奇观。',
		荆州市: '荆州，历史文化名城，古韵悠长。',
		襄阳市: '襄阳，古城文化与美食的结合。',
	},
	安徽: {
		合肥市: '创新之城合肥，科教文化汇聚地。',
		黄山市: '黄山，天下第一奇山，风景如画。',
		芜湖市: '芜湖，长江之畔，文化底蕴深厚。',
		马鞍山市: '马鞍山，文化与自然的完美结合。',
	},
	广西壮族自治区: {
		桂林市: '桂林山水甲天下，风景如画。',
		南宁市: '绿城南宁，宜居宜游。',
		柳州市: '柳州的螺蛳粉，独具风味。',
		防城港市: '防城港，海洋资源丰富，风景迷人。',
	},
	贵州: {
		贵阳市: '贵阳，山城之美，民族风情浓郁。',
		遵义市: '遵义，红色之城，历史悠久。',
		安顺市: '安顺，黄果树瀑布的故乡，风景如画。',
		毕节市: '毕节，拥有丰富的自然资源与人文景观。',
		六盘水市: '六盘水，凉爽的夏天，避暑胜地。',
		铜仁市: '铜仁，秀美的山水与独特的民族文化。',
		凯里市: '凯里，苗族文化的发源地，风情独特。',
	},
	云南: {
		昆明市: '春城昆明，四季如春，风景秀丽。',
		大理市: '苍山洱海，大理古城，你来了就不想走。',
		丽江市: '丽江古城，纳西文化的瑰宝。',
		西双版纳傣族自治州: '西双版纳，热带雨林的奇妙之地。',
	},
	西藏自治区: {
		拉萨市: '拉萨，西藏的首府，布达拉宫的故乡。',
		日喀则市: '日喀则，历史悠久的文化名城。',
		林芝市: '林芝，素有"西藏江南"之称，风景如画。',
		昌都市: '昌都，历史悠久，文化底蕴深厚。',
		山南市: '山南，藏文化的发源地之一。',
		那曲市: '那曲，草原风光，牧民生活的地方。',
		阿里地区: '阿里，神秘的西部，拥有壮丽的自然景观。',
	},
	新疆维吾尔自治区: {
		乌鲁木齐市: '乌鲁木齐，天山脚下的城市，文化多元。',
		喀什市: '喀什，古丝绸之路的重要节点，历史悠久。',
		克拉玛依市: '克拉玛依，石油之城，经济发展迅速。',
		吐鲁番市: '吐鲁番，火焰山的故乡，葡萄之乡。',
		哈密市: '哈密，哈密瓜的发源地，风景如画。',
		博乐市: '博乐，草原风光，民族文化交融。',
		阿克苏市: '阿克苏，苹果之乡，风景秀丽。',
		和田市: '和田，玉石之乡，历史文化深厚。',
	},
	内蒙古自治区: {
		呼和浩特市: '呼和浩特，内蒙古的首府，历史悠久。',
		包头市: '包头，钢铁之城，经济发展迅速。',
		乌兰察布市: '乌兰察布，草原文化与现代城市的结合。',
		赤峰市: '赤峰，拥有丰富的自然资源与人文景观。',
		通辽市: '通辽，草原文化的发源地，风情独特。',
		鄂尔多斯市: '鄂尔多斯，现代化城市与草原文化的交融。',
		巴彦淖尔市: '巴彦淖尔，黄河之畔，风景如画。',
		锡林郭勒盟: '锡林郭勒，草原辽阔，马背上的民族风情。',
	},
	陕西: {
		西安市: '西安，古都文化与兵马俑的故乡。',
		咸阳市: '咸阳，历史悠久，文化底蕴深厚。',
	},
	甘肃: {
		兰州市: '兰州，黄河之滨，牛肉面闻名。',
		天水市: '天水，历史悠久，文化底蕴深厚。',
	},
	青海: {
		西宁市: '西宁，青海湖的门户，风景如画。',
	},
	吉林: {
		长春市: '长春，汽车城，文化底蕴深厚。',
		吉林市: '吉林市，松花江畔，风景如画。',
	},
	黑龙江: {
		哈尔滨市: '哈尔滨，冰雪之城，俄罗斯风情浓厚。',
		齐齐哈尔市: '齐齐哈尔，黑龙江的明珠，文化底蕴深厚。',
	},
	山西: {
		太原市: '太原，山西会，历史悠久。',
	},
	辽宁: {
		沈阳市: '沈阳，重工业基地，文化底蕴深厚。',
		大连市: '大连，北方明珠，浪漫之都。',
	},
	海南: {
		海口市: '海口，阳光沙滩，椰风海韵。',
		三亚市: '三亚，碧海蓝天，度假胜地。',
	},
}

// 国家欢迎语映射
const countryWelcomeMap: Record<string, string> = {
	日本: 'よろしく，一起去看樱花吗',
	美国: 'Let us live in peace!',
	英国: '想同你一起夜乘伦敦眼',
	俄罗斯: '干了这瓶伏特加！',
	法国: 'C\'est La Vie',
	德国: 'Die Zeit verging im Fluge.',
	澳大利亚: '一起去大堡礁吧！',
	加拿大: '拾起一片枫叶赠予你',
	韩国: '一起去首尔购物吧！',
	新加坡: '花园城市新加坡，欢迎你！',
	印度: '探索神秘的咖喱之国！',
	巴西: '一起感受桑巴的热情！',
	意大利: '罗马假日，浪漫之旅！',
	西班牙: '弗拉门戈的舞步等你来！',
	荷兰: '风车与郁金香的国度！',
	瑞士: '阿尔卑斯山的雪景等你欣赏！',
	新西兰: '霍比屯的中土世界！',
	泰国: '萨瓦迪卡，一起去海滩吧！',
	马来西亚: '多元文化，美食天堂！',
	印度尼西亚: '千岛之国，潜水胜地！',
	菲律宾: '椰风海韵，度假天堂！',
	越南: '河内风情，岘港之美！',
	土耳其: '热气球之旅，卡帕多奇亚！',
	阿联酋: '奢华迪拜，沙漠奇迹！',
	沙特阿拉伯: '麦加朝圣，沙漠王国！',
	埃及: '金字塔，法老的呼唤！',
	南非: '彩虹之国，野生动物的天堂！',
	肯尼亚: '动物大迁徙，东非草原！',
	尼日利亚: '西非明珠，活力之国！',
	墨西哥: '玛雅文明，亡灵之城！',
	阿根廷: '探戈与足球的故乡！',
	智利: '复活节岛，葡萄酒之乡！',
	哥伦比亚: '咖啡之国，南美风情！',
	秘鲁: '马丘比丘，印加帝国！',
	希腊: '爱琴海畔，古典文明！',
	葡萄牙: '大航海时代的荣光！',
	比利时: '巧克力与啤酒的国度！',
	奥地利: '音乐之都，维也纳之声！',
	捷克: '布拉格广场上的钟声！',
	波兰: '肖邦的故乡，琥珀之路！',
	瑞典: '诺贝尔的故乡，北欧设计！',
	挪威: '峡湾与极光的胜地！',
	丹麦: '童话王国的魅力！',
	芬兰: '千湖之国，极光之地！',
	冰岛: '冰与火之国，温泉与瀑布！',
	爱尔兰: '绿岛之歌，威士忌之乡！',
	匈牙利: '多瑙河畔，温泉之国！',
	罗马尼亚: '德古拉城堡，特兰西瓦尼亚！',
	乌克兰: '黑海沿岸，葵花之乡！',
	哈萨克斯坦: '丝绸之路，中亚明珠！',
	巴基斯坦: '喜马拉雅的风光！',
	孟加拉国: '恒河三角洲，孟加拉湾！',
	斯里兰卡: '印度洋上的珍珠！',
	尼泊尔: '徒步天堂，雪山之国！',
	阿富汗: '兴都库什的呼唤！',
	伊朗: '波斯帝国的辉煌！',
	伊拉克: '两河流域，文明古国！',
	以色列: '圣城耶路撒冷！',
	约旦: '佩特拉古城，死海漂浮！',
	黎巴嫩: '中东小巴黎，美食天堂！',
	卡塔尔: '石油王国，沙漠明珠！',
	科威特: '石油之都，海湾风情！',
	巴林: '波斯湾的金融中心！',
	阿曼: '阿拉伯半岛的绿色角落！',
	厄瓜多尔: '赤道之国，亚马逊雨林！',
	乌拉圭: '南美瑞士，足球强国！',
	巴拉圭: '伊瓜苏瀑布的故乡！',
	委内瑞拉: '石油之国，加拉加斯！',
	玻利维亚: '天空之镜，乌尤尼盐沼！',
	巴拿马: '运河之都，连接两洋！',
	哥斯达黎加: '中美洲瑞士，生态旅游！',
	古巴: '加勒比海的雪茄与朗姆！',
	牙买加: '雷鬼音乐，蓝山咖啡！',
	多米尼加: '加勒比海度假胜地！',
	马达加斯加: '狐猴之岛，独一无二！',
	坦桑尼亚: '塞伦盖蒂，动物王国！',
	加纳: '黄金海岸，可可之国！',
	喀麦隆: '非洲缩影，文化熔炉！',
	摩洛哥: '摩洛哥风情，撒哈拉沙漠！',
	突尼斯: '迦太基古城，地中海明珠！',
}

// 响应式数据
const userLocation = shallowRef<IPLocation | null>(null)
const welcomeText = ref(DEFAULT_WELCOME_TEXT)
const distance = ref<number | null>(null)
const loading = ref(true)
const errorMessage = ref<string | null>(null)

// 计算属性
const locationDescription = computed(() => {
	if (!userLocation.value?.region)
		return '未知位置'

	const regionParts = userLocation.value.region.split(' ')
	const country = regionParts[0] || ''
	const province = regionParts[1] || ''
	const city = regionParts[2] || ''

	if (country === '中国') {
		return province === city ? province : `${province} ${city}`
	}
	else {
		return country
	}
})

// 时间段问候语
const timeGreeting = computed(() => {
	const hour = new Date().getHours()

	if (hour >= 5 && hour < 11)
		return '🌤️ 早上好，一日之计在于晨！'
	if (hour >= 11 && hour < 13)
		return '☀️ 中午好，记得午休喔~'
	if (hour >= 13 && hour < 17)
		return '🕞 下午好，饮茶先啦！'
	if (hour >= 17 && hour < 19)
		return '🚶‍♂️ 即将下班，记得按时吃饭~'
	if (hour >= 19 && hour < 24)
		return '🌙 晚上好，夜生活嗨起来！'
	return '夜深了，早点休息，少熬夜哦~'
})

function getDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
	const dLat = (lat2 - lat1) * Math.PI / 180
	const dLng = (lng2 - lng1) * Math.PI / 180
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
		+ Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
		* Math.sin(dLng / 2) * Math.sin(dLng / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return Math.round(EARTH_RADIUS * c)
}

// 缓存管理
function getIpInfoFromCache(): IPLocation | null {
	try {
		const cached = localStorage.getItem(CACHE_KEY)
		if (!cached)
			return null

		const { data, timestamp } = JSON.parse(cached)
		if (Date.now() - timestamp > CACHE_DURATION) {
			localStorage.removeItem(CACHE_KEY)
			return null
		}
		return data
	}
	catch (error) {
		console.error('读取缓存失败:', error)
		return null
	}
}

function setIpInfoToCache(data: IPLocation) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({
			data,
			timestamp: Date.now(),
		}))
	}
	catch (error) {
		console.error('保存缓存失败:', error)
	}
}

// 业务逻辑
// 根据用户位置设置欢迎语
function setWelcomeText(location: IPLocation) {
	if (!location?.region)
		return

	const regionParts = location.region.split(' ')
	const country = regionParts[0] || ''
	const province = regionParts[1] || ''
	const city = regionParts[2] || ''

	if (country === '中国') {
		// 优先使用城市特定欢迎语，否则使用份默认欢迎语
		welcomeText.value = cityWelcomeMap[province]?.[city]
			|| provinceWelcomeMap[province]
			|| '带我去你的城市逛逛吧！'
	}
	else {
		// 其他国家的欢迎语
		welcomeText.value = countryWelcomeMap[country]
			|| '带我去你的国家逛逛吧'
	}
}

// 计算用户与博主位置的距离
function calculateDistance(data: IPLocation) {
	try {
		const { latitude, longitude } = data

		// 检查经纬度是否有效
		if (latitude && longitude) {
			distance.value = getDistance(REFERENCE_LNG, REFERENCE_LAT, longitude, latitude)
		}
		else {
			distance.value = null
		}
	}
	catch (error) {
		console.error('计算距离失败:', error)
		distance.value = null
	}
}

// 获取用户IP位置信息
async function fetchIPLocation() {
	// 重置状态
	loading.value = true
	errorMessage.value = null

	try {
		// 1. 尝试从缓存获取数据
		const cachedData = getIpInfoFromCache()
		if (cachedData) {
			userLocation.value = cachedData
			setWelcomeText(cachedData)
			calculateDistance(cachedData)
			return
		}

		// 2. 从API获取新数据
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 3000)

		const response = await fetch(API_URL, { signal: controller.signal })

		clearTimeout(timeoutId)

		if (!response.ok) {
			throw new Error(`HTTP错误! 状态码: ${response.status}`)
		}

		const data: IPLocation = await response.json()

		// 处理响应数据
		if (data.ip && data.region) {
			// 保存数据到缓存
			setIpInfoToCache(data)

			// 更新组件状态
			userLocation.value = data
			setWelcomeText(data)
			calculateDistance(data)
		}
	}
	catch (error) {
		// 错误处理
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage.value = '请求超时，请稍后重试'
			}
			else if (error.message.includes('Network')) {
				errorMessage.value = '网络连接失败'
			}
			else {
				errorMessage.value = error.message
			}
		}
		else {
			errorMessage.value = '获取IP位置信息失败'
		}

		console.error('获取IP位置信息失败:', error)

		welcomeText.value = DEFAULT_WELCOME_TEXT
	}
	finally {
		loading.value = false
	}
}

// 组件挂载时初始化
onMounted(() => {
	fetchIPLocation()
})
</script>

<template>
<BlogWidget card title="访客信息">
	<div v-if="loading" class="loading">
		<div class="loading-spinner" />
		<span>获取位置信息中...</span>
	</div>

	<div v-else-if="errorMessage" class="error">
		<div class="error-icon">
			😕
		</div>
		<p>{{ errorMessage }}</p>
		<ZButton text="重试" class="retry-btn" @click="fetchIPLocation" />
	</div>

	<div v-else class="welcome-message">
		<div class="message-content">
			<p>欢迎来自 <b>{{ locationDescription }}</b> 的小友💖</p>
			<p v-if="distance">
				当前位置距博主约 <b>{{ distance }}</b> 公里！
			</p>
			<p><b>{{ timeGreeting }}</b></p>
			<p>Tip：<b>{{ welcomeText }}</b></p>
		</div>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.widget-title {
	color: var(--c-primary);
}

.loading, .error {
	padding: 1rem;
	text-align: center;
	color: var(--c-text-2);
}

.welcome-message {
	padding: 0.5rem;

	.message-content {
		line-height: 1;

		p {
			margin-bottom: 0.3rem;

			&:last-child {
				margin-bottom: 0;
			}

			b {
				color: var(--c-primary);
			}
		}
	}
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.8rem;

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgb(0 0 0 / 10%);
		border-top: 3px solid var(--c-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
}

.error {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;

	.error-icon {
		margin-bottom: 0.5rem;
		font-size: 2rem;
	}
}

.retry-btn {
	margin-top: 0.5rem;

	&:hover,
	&:active {
		color: var(--c-primary);
	}
}
</style>
