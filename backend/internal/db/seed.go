package db

import (
	"errors"
	"math"
	"regexp"
	"sort"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
)

var tierLabels = []string{"A賞", "B賞", "C賞", "D賞", "E賞"}
var tierWeights = []int{1, 2, 6, 10, 14}

const lastPrizeTier = "最後賞"

type seedProduct struct {
	ID         string
	Title      string
	Price      int
	TotalCount int
	PrizeNames []string
}

var seedProducts = []seedProduct{
	{
		ID: "frieren-journey-1", Title: "日版 一番賞《葬送的芙莉蓮》魔法使的旅途 Vol.1",
		Price: 400, TotalCount: 80,
		PrizeNames: []string{"芙莉蓮 1/7 手辦", "欣梅爾 紀念雕像", "海塔 亞克力立牌", "修塔爾克 徽章組", "全員紀念場景模型"},
	},
	{
		ID: "hunterxhunter-greed-island", Title: "日版 一番賞《HUNTER×HUNTER 獵人》貪婪之島篇",
		Price: 420, TotalCount: 81,
		PrizeNames: []string{"奇犽 1/7 手辦", "小傑 躍動模型", "庫拉皮卡 亞克力立牌", "雷歐力 鑰匙圈", "全員紀念場景模型"},
	},
	{
		ID: "onepiece-wano-1", Title: "日版 一番賞《航海王 ONE PIECE》和之國篇",
		Price: 380, TotalCount: 70,
		PrizeNames: []string{"魯夫 五檔 手辦", "索隆 三刀流 模型", "娜美 亞克力立牌", "香吉士 徽章組", "喬巴 絨毛玩偶"},
	},
	{
		ID: "deep-sea-tank-2", Title: "原創一番賞《深海水族箱》#2",
		Price: 280, TotalCount: 50,
	},
	{
		ID: "iphone-16-pro-max", Title: "3C賞《iPhone 16 Pro Max 現貨直抽》",
		Price: 500, TotalCount: 30,
		PrizeNames: []string{"iPhone 16 Pro Max 1TB 鈦金屬", "iPhone 16 Pro 256GB", "AirPods Pro 2", "MagSafe 行動電源", "全獎項紀念好禮組"},
	},
	{
		ID: "scratch-lucky-star", Title: "刮刮樂《幸運星塵》即刮即中",
		Price: 100, TotalCount: 200,
	},
	{
		ID: "cozy-room-living", Title: "生活雜貨賞《質感小窩》",
		Price: 220, TotalCount: 45,
	},
	{
		ID: "trading-card-arcane", Title: "原創卡牌賞《秘術學院》booster",
		Price: 180, TotalCount: 100,
	},
	{
		ID: "onepiece-summit-last", Title: "日版 最後賞直接抽！航海王 ONE PIECE -頂上決戰-",
		Price: 480, TotalCount: 60,
		PrizeNames: []string{"魯夫 頂上決戰 手辦", "白鬍子 紀念模型", "艾斯 亞克力立牌", "赤犬 徽章組", "全員紀念場景模型"},
	},
	{
		ID: "jujutsukaisen-shibuya", Title: "日版 一番賞《咒術迴戰》澀谷事變篇",
		Price: 400, TotalCount: 81,
		PrizeNames: []string{"五條悟 1/7 手辦", "虎杖悠仁 躍動模型", "伏黑惠 式神立牌", "釘崎野薔薇 徽章組", "全員紀念場景模型"},
	},
	{
		ID: "demonslayer-hashira", Title: "日版 一番賞《鬼滅之刃》柱稽古篇",
		Price: 380, TotalCount: 75,
		PrizeNames: []string{"竈門炭治郎 柱稽古 手辦", "冨岡義勇 模型", "甘露寺蜜璃 亞克力立牌", "宇髄天元 徽章組", "全柱紀念場景模型"},
	},
	{
		ID: "spyxfamily-mission", Title: "日版 一番賞《SPY×FAMILY 間諜家家酒》任務日常",
		Price: 320, TotalCount: 60,
		PrizeNames: []string{"洛伊德・佛傑 手辦", "約兒・佛傑 模型", "阿妮亞・佛傑 絨毛玩偶", "邦德 絨毛玩偶", "佛傑一家紀念合照立牌"},
	},
}

var genericPrizePrefix = regexp.MustCompile(`^原創(一番賞|自製賞|卡牌賞)`)

type seedShopItem struct {
	ID          string
	Name        string
	Description string
	Category    string
	Cost        int
	Stock       int
}

var ShopCategoryOrder = []string{"生活雜貨", "周邊小物", "3C", "兌換券"}

var seedShopItems = []seedShopItem{
	{ID: "shop-canvas-bag", Name: "IchibanGo 限定帆布袋", Description: "官方限定聯名帆布袋，厚磅帆布材質，可放 A4 文件。", Category: "生活雜貨", Cost: 300, Stock: 20},
	{ID: "shop-acrylic-stand", Name: "人氣角色壓克力立牌組", Description: "隨機出貨，共 5 款人氣角色造型任選一款。", Category: "周邊小物", Cost: 450, Stock: 12},
	{ID: "shop-sticker-pack", Name: "一番賞紀念貼紙組", Description: "收錄歷年人氣賞品造型貼紙，一組 10 入。", Category: "周邊小物", Cost: 80, Stock: 60},
	{ID: "shop-shipping-voucher", Name: "全店免運兌換券", Description: "下次結帳可折抵一筆訂單的運費。", Category: "兌換券", Cost: 150, Stock: 0},
	{ID: "shop-mug", Name: "質感陶瓷馬克杯", Description: "350ml 骨瓷馬克杯，可微波使用。", Category: "生活雜貨", Cost: 350, Stock: 8},
	{ID: "shop-keychain", Name: "限量壓克力鑰匙圈", Description: "限量編號版壓克力鑰匙圈。", Category: "周邊小物", Cost: 200, Stock: 0},
	{ID: "shop-power-bank", Name: "10000mAh 快充行動電源", Description: "支援 PD 快充，附贈收納袋。", Category: "3C", Cost: 600, Stock: 15},
	{ID: "shop-earbuds", Name: "真無線藍牙耳機", Description: "主動降噪，續航 24 小時（含充電盒）。", Category: "3C", Cost: 800, Stock: 5},
}

func Seed(database *gorm.DB) error {
	return database.Transaction(func(tx *gorm.DB) error {
		for _, sp := range seedProducts {
			if err := tx.FirstOrCreate(&models.Product{ID: sp.ID, Price: sp.Price}, "id = ?", sp.ID).Error; err != nil {
				return err
			}

			var existing int64
			if err := tx.Model(&models.Prize{}).Where("product_id = ?", sp.ID).Count(&existing).Error; err != nil {
				return err
			}
			if existing > 0 {
				continue
			}

			if err := tx.Create(seedPrizes(sp)).Error; err != nil {
				return err
			}
		}

		for i, si := range seedShopItems {
			var existing models.ShopItem
			err := tx.First(&existing, "id = ?", si.ID).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				item := models.ShopItem{
					ID:          si.ID,
					Name:        si.Name,
					Description: si.Description,
					Category:    si.Category,
					Cost:        si.Cost,
					Stock:       si.Stock,
					SortOrder:   i,
				}
				if err := tx.Create(&item).Error; err != nil {
					return err
				}
				continue
			}
			if err != nil {
				return err
			}

			if err := tx.Model(&existing).Updates(map[string]any{
				"name":        si.Name,
				"description": si.Description,
				"category":    si.Category,
				"cost":        si.Cost,
				"sort_order":  i,
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func seedPrizes(sp seedProduct) []models.Prize {
	tiers := tierLabels
	weights := tierWeights
	if sp.TotalCount <= len(tierLabels) {
		tiers = tierLabels[:1]
		weights = []int{1}
	}

	totals := apportion(sp.TotalCount, weights[:len(tiers)])

	prizes := make([]models.Prize, 0, len(tiers)+1)
	for i, tier := range tiers {
		name := genericPrizeName(sp, i)
		if i < len(sp.PrizeNames) {
			name = sp.PrizeNames[i]
		}
		prizes = append(prizes, models.Prize{
			ID:         uuid.NewString(),
			ProductID:  sp.ID,
			Tier:       tier,
			Name:       name,
			Stock:      totals[i],
			TotalStock: totals[i],
			Weight:     weights[i],
			SortOrder:  i,
		})
	}

	prizes = append(prizes, models.Prize{
		ID:         uuid.NewString(),
		ProductID:  sp.ID,
		Tier:       lastPrizeTier,
		Name:       sp.Title + " 全員紀念場景模型",
		Stock:      1,
		TotalStock: 1,
		Weight:     1,
		SortOrder:  len(tierLabels),
	})

	return prizes
}

func genericPrizeName(sp seedProduct, i int) string {
	base := strings.TrimSpace(genericPrizePrefix.ReplaceAllString(sp.Title, ""))
	return base + " 特別獎項 " + string(rune('1'+i))
}

func apportion(total int, weights []int) []int {
	weightSum := 0
	for _, w := range weights {
		weightSum += w
	}
	if weightSum == 0 || total <= 0 {
		return make([]int, len(weights))
	}

	quotas := make([]float64, len(weights))
	floors := make([]int, len(weights))
	allocated := 0
	for i, w := range weights {
		q := float64(w) / float64(weightSum) * float64(total)
		quotas[i] = q
		floors[i] = int(math.Floor(q))
		allocated += floors[i]
	}
	remainder := total - allocated

	type frac struct {
		index    int
		fraction float64
	}
	order := make([]frac, len(weights))
	for i := range weights {
		order[i] = frac{i, quotas[i] - float64(floors[i])}
	}
	sort.Slice(order, func(a, b int) bool { return order[a].fraction > order[b].fraction })

	result := append([]int(nil), floors...)
	for k := 0; k < remainder; k++ {
		result[order[k%len(order)].index]++
	}
	return result
}
