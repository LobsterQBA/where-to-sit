# Where to Sit — Seattle IMAX 首批影厅可模拟性清单

研究日期：2026-08-03（America/Los_Angeles）
产品范围：Seattle Metro 的 IMAX 影厅；这是静态研究清单，不是实时场次或座位库存。

## 先给结论

**目前没有任何一家候选影厅达到“真实逐座位模拟”的发布门槛。**

公开资料足以可靠地建立“在哪里有 IMAX、哪家是否在运营、是否为 Laser、银幕大致多大”的发现层；但没有发现可再利用的逐排座号、过道、每排座数、第一排距幕、排距和高差。不能把购票网站的实时选座状态当成可公开复用的数据集。

因此首版应分开两种体验：

1. **Seat-zone guide（可做）**：基于已核验的银幕/格式资料，告诉用户偏沉浸、偏舒适、偏完整画面时应到前/中/后哪个区域；明确标为 `estimated`。
2. **Exact seat simulator（暂不做）**：只有取得固定座位图与几何证据后，才能展示 `Row G, Seat 12` 的具体视野，且不能显示实时可售状态。

## 证据与发布标准

| 层级 | 必需证据 | 站内可说什么 |
| --- | --- | --- |
| `Verified exact` | 当前运营状态、可引用银幕尺寸、固定行列/过道图、首排距离/排距/高差或可复核平面图 | “此座位的几何模拟”；不是实时余票 |
| `Estimated zone` | 当前运营状态、至少一项可靠银幕/制式信息 | “推荐区域（估算）” |
| `Discovery only` | 当前场馆与 IMAX 身份 | “该影厅存在”；不输出座位建议 |
| `Monitor / exclude` | 曾是重要影厅，但当前不适用 | 不进入首发选择器 |

## 首批候选

| 影厅 | 当前状态证据 | 已有可用规格证据 | 座位/几何证据 | 结论 |
| --- | --- | --- | --- | --- |
| **PACCAR IMAX, Pacific Science Center**（Seattle） | PacSci 当前列出 Feature Movies；IMAX 官方列为 Stadium Seating 与无障碍。 | **官方**：37 ft × 60 ft 银幕；PacSci 说明其为 2011 年转换为数字放映。 | 官方明确**不提供预选座**；未找到可公开复用的固定座位图。 | **首个 Seat-zone pilot**：最适合做“早到后该坐哪个区域”的估算引导；不能做真实行列点选。 |
| **AMC Alderwood Mall 16 & IMAX**（Lynnwood） | IMAX 官方当前标为 IMAX with Laser、Stadium Seating。 | LF Examiner 有历史尺寸/容量条目，适合作为待复核线索，不可作为唯一生产数据。 | 未找到固定座位图或完整几何。 | `Estimated zone` 候选；先向 AMC/场馆索取影厅平面图或可公开 seating chart。 |
| **AMC Kent Station 14 & IMAX**（Kent） | AMC 当前页列 IMAX with Laser、Reserved Seating、Signature Recliners；IMAX 官方也收录。 | LF Examiner 有历史尺寸/容量线索，须重核。 | 未找到固定座位图或完整几何。 | `Estimated zone` 候选；若获得场馆许可的 seat map，是最有价值的 exact-simulator 候选之一。 |
| **AMC Southcenter 16 & IMAX**（Tukwila） | AMC/IMAX 当前列 IMAX with Laser、Reserved Seating、Stadium Seating。 | LF Examiner 有历史尺寸/容量线索，须重核。 | 未找到固定座位图或完整几何。 | `Estimated zone` 候选；不能从购票流程复制座位网格。 |
| **Regal Thornton Place & IMAX**（Seattle） | IMAX 官方当前标为 IMAX with Laser、Reserved Seating、Stadium Seating。 | LF Examiner 有历史尺寸/容量线索，须重核。 | 未找到固定座位图或完整几何。 | `Estimated zone` 候选；是 Seattle 市内商业 IMAX 的高优先级补证对象。 |
| **Regal Issaquah Highlands & IMAX**（Issaquah） | IMAX 官方当前收录；场次资料显示 IMAX、Reserved Seating、Stadium Seating。 | LF Examiner 有历史尺寸线索；官方目录未标示 Laser，投影技术不能推定。 | 未找到固定座位图或完整几何。 | `Discovery / estimated`；先核验放映系统，再决定是否进入 seat-zone 层。 |
| **Cinemark Lincoln Square Cinemas and IMAX**（Bellevue） | Cinemark 当前场次页标示 IMAX 与 Stadium Seating，且有 IMAX 场次。 | LF Examiner 有历史尺寸/容量线索，须重核。 | 未找到固定座位图或完整几何。 | `Estimated zone` 候选；须补当前投影系统与许可明确的几何资料。 |
| **IMAX at the Center（former Boeing IMAX Theater）**（Seattle） | IMAX 官方仍有目录页；近期报道指出其已停止上映好莱坞故事片。 | PacSci 历史资料称银幕宽 80 ft；其当前运营/节目状态仍在变化。 | 不适用。 | **Monitor / exclude**：不要放进首发“去哪儿坐”选择器，直到场次与运营重新稳定。 |

## 对数据源的处理

### 可作为产品基础

- **运营状态、场馆名称、地址、IMAX/Laser 标签**：优先 IMAX 官方与影院运营商当前页面；每次更新记录 `checked_at`。
- **PACCAR 银幕尺寸与无预选座规则**：PacSci 官方页面，可直接作为其资料卡证据。
- **用户提交或场馆授权的座位图**：只有在明确允许使用/再分发且去除了实时余票后，才能写入公开数据层。

### 只能做研究线索，不能直接变成产品事实

- **LF Examiner**：有 Seattle Metro 多家影厅的尺寸、容量和投影历史，但网页写明更新频率已停止，页面数据截至 2021 年；页面采用 CC BY-NC-SA 4.0。它适合排补证优先级，不能单独支撑当前、商业可用的产品数据。
- **票务网站选座页**：是交易流程及可能含实时库存的数据。不要抓取、镜像或公开重放；即使用户提供截图，也只可在确认授权与条款后人工提取非实时的布局事实。
- **论坛、Reddit、影迷表格**：可作为“去查哪里”的线索，不作为已核验规格。

## 推荐的第一条可实现路径

### v0：PACCAR 的 `arrive-and-choose` 指南

原因：它是当前 Seattle 市内仍在放映 Feature Movies 的 IMAX，官方给出银幕尺寸；而且不提供预选座，用户恰好需要“进场后朝哪里坐”的帮助。

首版只可以说：

- 以 37 × 60 ft 银幕为基准的前/中/后区域比较；
- “更沉浸 / 更均衡 / 更容易看全画面”的**估算**建议；
- `Seat layout not yet verified`，不展示虚构的座号、行号或可售状态。

### exact-simulator 的硬门槛

取得以下任一可再分发或有明确许可的资料后，才升级到逐座位：

1. 影厅/运营商提供的 seating chart、平面图或 CAD；
2. 公开发布且允许使用的座位表，包含每排、过道和无障碍位；
3. 有来源的测量资料：首排距离、排距、台阶高差、银幕底边高度；
4. 记录来源、采集日期、许可、版本和每个字段的 `verified / estimated` 状态。

## 下一步补证顺序

1. 为 PACCAR 寻找/请求固定座位示意或历史场馆平面图；没有它就只做 zone guide。
2. 向 AMC Kent、AMC Southcenter、Regal Thornton、Cinemark Lincoln Square 询问是否有可引用的无障碍座位/影厅 seating chart 或媒体资料。
3. 建立一个不含座位库存的 `auditorium_evidence` 数据表：字段值、来源 URL、检查日期、许可、可信度和失效日期。
4. 只有拿到一家具备完整布局证据的影厅，才开始 3D exact-seat 原型。

## 来源（访问于 2026-08-03）

- Pacific Science Center, [IMAX](https://pacificsciencecenter.org/visit/imax/)：PACCAR 当前节目、37 × 60 ft、无预选座、无障碍说明。
- IMAX, [PACCAR IMAX](https://www.imax.com/theatre/paccar-imax-pacific-science-center)、[AMC Alderwood](https://www.imax.com/theatre/amc-alderwood-mall-16-imax)、[AMC Southcenter](https://www.imax.com/theatre/amc-southcenter-16-imax/no-other-choice)、[Regal Thornton Place](https://www.imax.com/theatre/regal-thornton-place-imax/disclosure-day)、[Regal Issaquah Highlands](https://www.imax.com/theatre/regal-issaquah-highlands-imax)：当前场馆和已展示的 amenity 标签。
- AMC, [Kent Station 14](https://www.amctheatres.com/movie-theatres/seattle-tacoma/amc-kent-station-14) 与 [Southcenter 16](https://www.amctheatres.com/movie-theatres/seattle/amc-southcenter-16/showtimes)：当前格式与座位/无障碍特征。
- Cinemark, [Lincoln Square Cinemas and IMAX](https://www.cinemark.com/theatres/wa-bellevue/cinemark-lincoln-square-cinemas-and-imax/)：当前 IMAX 场次与 Stadium Seating。
- LF Examiner, [Theaters](https://lfexaminer.com/theaters/)：历史尺寸、容量与投影线索；网页注明资料更新至 2021-10-17，许可为 CC BY-NC-SA 4.0。
- Axios, [Seattle's full-size IMAX change](https://www.axios.com/local/seattle/2026/07/24/why-the-odyssey-not-playing-boeing-imax-seattle-full-143-screen)：former Boeing 的近期运营状态背景；非产品规格来源。
