/**
 * Pixel Factory - 风格配置
 * 精心设计的视觉风格库
 */

const IMAGE_STYLES = {
    photography: {
        name: '摄影风格',
        icon: '📷',
        description: '真实摄影质感',
        styles: [
            {
                id: 'portrait',
                name: '人像摄影',
                icon: '🧑',
                description: '专业人像，柔和光感',
                prompt: 'professional portrait photography, soft lighting, shallow depth of field, bokeh, Canon 85mm lens, natural skin tones',
                color: '#FF6B6B'
            },
            {
                id: 'landscape',
                name: '风景摄影',
                icon: '🏔️',
                description: '广阔风景，HDR',
                prompt: 'landscape photography, HDR, wide angle, dramatic lighting, golden hour, vibrant colors, sharp details',
                color: '#4ECDC4'
            },
            {
                id: 'macro',
                name: '微距摄影',
                icon: '🔍',
                description: '极致细节，背景虚化',
                prompt: 'macro photography, extreme close-up, shallow depth of field, crystal clear details, blurred background',
                color: '#95E1D3'
            },
            {
                id: 'street',
                name: '街头摄影',
                icon: '🌆',
                description: '纪实风格，人文气息',
                prompt: 'street photography, candid moment, urban atmosphere, documentary style, natural lighting',
                color: '#F38181'
            },
            {
                id: 'product',
                name: '商业摄影',
                icon: '💎',
                description: '产品展示，精细布光',
                prompt: 'product photography, studio lighting, clean background, professional setup, sharp focus',
                color: '#AA96DA'
            }
        ]
    },
    art: {
        name: '艺术风格',
        icon: '🎨',
        description: '经典艺术表现',
        styles: [
            {
                id: 'oil-painting',
                name: '油画风格',
                icon: '🖼️',
                description: '丰富色彩，笔触质感',
                prompt: 'oil painting style, rich brushstrokes, classical art technique, vibrant colors, textured surface, museum quality',
                color: '#FFD93D'
            },
            {
                id: 'watercolor',
                name: '水彩风格',
                icon: '💧',
                description: '清新透明，晕染效果',
                prompt: 'watercolor painting, soft edges, transparent layers, delicate colors, flowing gradients, paper texture',
                color: '#A8E6CF'
            },
            {
                id: 'sketch',
                name: '素描风格',
                icon: '✏️',
                description: '铅笔线条，黑白质感',
                prompt: 'pencil sketch, charcoal drawing, black and white, detailed shading, artistic linework',
                color: '#6C5B7B'
            },
            {
                id: 'impressionist',
                name: '印象派',
                icon: '🌸',
                description: '光色变化，莫奈风格',
                prompt: 'impressionist painting style, Claude Monet, soft light, colorful brushstrokes, atmospheric perspective',
                color: '#FFAAA5'
            },
            {
                id: 'surrealist',
                name: '超现实主义',
                icon: '🌀',
                description: '梦幻想象，达利风格',
                prompt: 'surrealist art, Salvador Dali style, dreamlike atmosphere, impossible geometry, symbolic imagery',
                color: '#9B59B6'
            }
        ]
    },
    anime: {
        name: '动漫风格',
        icon: '🎌',
        description: '日式动漫美学',
        styles: [
            {
                id: 'anime',
                name: '日系动漫',
                icon: '⛩️',
                description: '经典日漫风格',
                prompt: 'anime style, manga art, cel shading, vibrant colors, clean lines, Japanese animation aesthetic',
                color: '#FF6B9D'
            },
            {
                id: 'chibi',
                name: 'Q版可爱',
                icon: '🧸',
                description: '萌系Q版风格',
                prompt: 'chibi style, cute proportions, large eyes, kawaii aesthetic, soft colors, adorable design',
                color: '#FFB6C1'
            },
            {
                id: 'ghibli',
                name: '吉卜力风格',
                icon: '🏯',
                description: '宫崎骏美学',
                prompt: 'Studio Ghibli style, Hayao Miyazaki, hand-drawn aesthetic, serene atmosphere, lush colors, detailed backgrounds',
                color: '#87CEEB'
            },
            {
                id: 'cyber-anime',
                name: '赛博动漫',
                icon: '🤖',
                description: '科技感动漫',
                prompt: 'cyberpunk anime, neon lights, futuristic aesthetic, mechanical details, high contrast',
                color: '#00CED1'
            },
            {
                id: 'shojo',
                name: '少女漫画',
                icon: '🌸',
                description: '浪漫柔美风格',
                prompt: 'shojo manga style, romantic aesthetic, soft lines, sparkles, delicate features, pastel colors',
                color: '#FFB7C5'
            }
        ]
    },
    digital: {
        name: '数字艺术',
        icon: '💻',
        description: '现代数字创作',
        styles: [
            {
                id: '3d-render',
                name: '3D 渲染',
                icon: '🎲',
                description: '立体质感，精细建模',
                prompt: '3D render, Octane render, ray tracing, subsurface scattering, photorealistic, high detail',
                color: '#7F8C8D'
            },
            {
                id: 'pixel-art',
                name: '像素艺术',
                icon: '👾',
                description: '复古像素风格',
                prompt: 'pixel art, 16-bit style, retro gaming aesthetic, limited color palette, blocky design',
                color: '#E74C3C'
            },
            {
                id: 'vector',
                name: '矢量插画',
                icon: '📐',
                description: '扁平简洁，几何美学',
                prompt: 'vector illustration, flat design, clean lines, geometric shapes, minimalist aesthetic',
                color: '#3498DB'
            },
            {
                id: 'concept-art',
                name: '概念艺术',
                icon: '🎭',
                description: '游戏概念设计',
                prompt: 'concept art, digital painting, fantasy art, detailed environment, dramatic composition',
                color: '#9B59B6'
            },
            {
                id: 'glitch',
                name: '故障艺术',
                icon: '📺',
                description: '数字故障效果',
                prompt: 'glitch art, digital distortion, RGB split, pixel sorting, cyberpunk aesthetic',
                color: '#00FF00'
            }
        ]
    },
    design: {
        name: '设计风格',
        icon: '✨',
        description: '专业设计美学',
        styles: [
            {
                id: 'minimalist',
                name: '极简主义',
                icon: '⚪',
                description: '简洁留白，克制冷感',
                prompt: 'minimalist design, clean composition, negative space, simple shapes, monochromatic color scheme',
                color: '#ECF0F1'
            },
            {
                id: 'cyberpunk',
                name: '赛博朋克',
                icon: '🌃',
                description: '霓虹未来，暗黑科技',
                prompt: 'cyberpunk aesthetic, neon lights, dark atmosphere, futuristic city, holographic elements, high contrast',
                color: '#E74C3C'
            },
            {
                id: 'vaporwave',
                name: '蒸汽波',
                icon: '🌴',
                description: '复古未来，粉色美学',
                prompt: 'vaporwave aesthetic, retro 80s, pastel pinks and purples, glitch effects, nostalgic atmosphere',
                color: '#FF69B4'
            },
            {
                id: 'bauhaus',
                name: '包豪斯',
                icon: '🔶',
                description: '几何构成，经典设计',
                prompt: 'Bauhaus style, geometric shapes, primary colors, functional design, grid-based composition',
                color: '#E67E22'
            },
            {
                id: 'art-deco',
                name: '装饰艺术',
                icon: '💠',
                description: '奢华典雅，流线造型',
                prompt: 'Art Deco style, geometric patterns, gold accents, luxurious aesthetic, elegant curves',
                color: '#D4AF37'
            }
        ]
    },
    lighting: {
        name: '光线氛围',
        icon: '💡',
        description: '专业光照设定',
        styles: [
            {
                id: 'golden-hour',
                name: '黄金时刻',
                icon: '🌅',
                description: '温暖晨昏光',
                prompt: 'golden hour lighting, warm tones, soft shadows, sun flare, magical atmosphere',
                color: '#FFA500'
            },
            {
                id: 'blue-hour',
                name: '蓝色时刻',
                icon: '🌆',
                description: '静谧蓝调光',
                prompt: 'blue hour lighting, twilight blue, moody atmosphere, city lights, serene mood',
                color: '#4682B4'
            },
            {
                id: 'neon',
                name: '霓虹灯光',
                icon: '🌈',
                description: '彩色霓虹效果',
                prompt: 'neon lighting, vibrant colors, glow effects, nighttime atmosphere, electric aesthetic',
                color: '#FF1493'
            },
            {
                id: 'cinematic',
                name: '电影光效',
                icon: '🎬',
                description: '戏剧性布光',
                prompt: 'cinematic lighting, dramatic shadows, film noir aesthetic, moody atmosphere, professional lighting setup',
                color: '#2C3E50'
            },
            {
                id: 'natural',
                name: '自然光线',
                icon: '☀️',
                description: '柔和自然光',
                prompt: 'natural lighting, soft sunlight, organic feel, daylight, authentic atmosphere',
                color: '#FFE4B5'
            }
        ]
    }
};

// 默认风格映射（用于快速访问）
const STYLE_MAP = {};
Object.values(IMAGE_STYLES).forEach(category => {
    category.styles.forEach(style => {
        STYLE_MAP[style.id] = style;
    });
});
