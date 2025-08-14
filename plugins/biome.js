// 导入群系填充API
const fillBiomeAPI = ll.import("fillbiome", "fillBiomeConditional");

class BiomeManager {
    static instance = null;
    static config = null;
    static biomeRegistry = new Map([
        ["海洋", "ocean"], ["平原", "plains"], ["沙漠", "desert"], ["风袭丘陵", "extreme_hills"],
        ["森林", "forest"], ["针叶林", "taiga"], ["沼泽", "swampland"], ["河流", "river"],
        ["冻洋", "frozen_ocean"], ["冻河", "frozen_river"], ["积雪的平原", "ice_plains"],
        ["雪山", "ice_mountains"], ["蘑菇岛", "mushroom_island"], ["蘑菇岛岸", "mushroom_island_shore"], ["沙滩", "beach"],
        ["沙漠丘陵", "desert_hills"], ["繁茂的丘陵", "forest_hills"], ["针叶林丘陵", "taiga_hills"], ["山地边缘", "extreme_hills_edge"],
        ["丛林", "jungle"], ["丛林丘陵", "jungle_hills"], ["稀疏的丛林", "jungle_edge"], ["深海", "deep_ocean"],
        ["石岸", "stone_beach"], ["积雪的沙滩", "cold_beach"], ["桦木森林", "birch_forest"], ["桦木森林丘陵", "birch_forest_hills"],
        ["黑森林", "roofed_forest"], ["积雪的针叶林", "cold_taiga"], ["积雪的针叶林丘陵", "cold_taiga_hills"], ["原始松木针叶林", "mega_taiga"],
        ["巨型针叶林丘陵", "mega_taiga_hills"], ["风袭森林", "extreme_hills_plus_trees"], ["热带草原", "savanna"], ["热带高原", "savanna_plateau"],
        ["恶地", "mesa"], ["恶地高原", "mesa_plateau"], ["繁茂的恶地高原", "mesa_plateau_stone"], ["暖水海洋", "warm_ocean"],
        ["温水海洋", "lukewarm_ocean"], ["冷水海洋", "cold_ocean"], ["暖水深海", "deep_warm_ocean"], ["温水深海", "deep_lukewarm_ocean"],
        ["冷水深海", "deep_cold_ocean"], ["冰冻深海", "deep_frozen_ocean"], ["向日葵平原", "sunflower_plains"], ["沙漠湖泊", "desert_mutated"],
        ["风袭沙砾丘陵", "extreme_hills_mutated"], ["繁花森林", "flower_forest"], ["针叶林山地", "taiga_mutated"], ["沼泽丘陵", "swampland_mutated"],
        ["冰刺平原", "ice_plains_spikes"], ["丛林变种", "jungle_mutated"], ["丛林边缘变种", "jungle_edge_mutated"], ["原始桦木森林", "birch_forest_mutated"],
        ["高大桦木丘陵", "birch_forest_hills_mutated"], ["黑森林丘陵", "roofed_forest_mutated"], ["积雪的针叶林山地", "cold_taiga_mutated"],
        ["原始云杉针叶林", "redwood_taiga_mutated"], ["巨型云杉针叶林丘陵", "redwood_taiga_hills_mutated"], ["沙砾山地+", "extreme_hills_plus_trees_mutated"],
        ["风袭热带草原", "savanna_mutated"], ["破碎的热带高原", "savanna_plateau_mutated"], ["被风蚀的恶地", "mesa_bryce"],
        ["恶地高原变种", "mesa_plateau_mutated"], ["繁茂的恶地高原变种", "mesa_plateau_stone_mutated"], ["竹林", "bamboo_jungle"],
        ["竹林丘陵", "bamboo_jungle_hills"], ["尖峭山峰", "jagged_peaks"], ["冰封山峰", "frozen_peaks"], ["积雪的山坡", "snowy_slopes"],
        ["雪林", "grove"], ["草甸", "meadow"], ["繁茂洞穴", "lush_caves"], ["溶洞", "dripstone_caves"], ["裸岩山峰", "stony_peaks"]
    ]);

    playerCooldownTracker = new Map();

    constructor() {
        // 不创建新的
        if (BiomeManager.instance) return BiomeManager.instance;
        this.loadConfiguration();
        BiomeManager.instance = this;
    }

    static getInstance() {
        if (!this.instance) this.instance = new BiomeManager();
        return this.instance;
    }

    // 配置文件 , (不想写了 , 直接修改下方的 cooldown 单位 秒 )
    loadConfiguration() {
        BiomeManager.config = {
            cooldown: 50000, // 单位 秒
            ui: { itemsPerPage: 12, enablePagination: true }, // 分页  itemsPerPage 是每页的延迟
            settings: { enableCooldown: true } // 是否启用冷却
        };
    }

    // 验证玩家是否还在冷却中
    validateCooldown(playerXuid) {
        if (!BiomeManager.config.settings.enableCooldown) return { allowed: true };

        const currentTimestamp = Date.now();
        const lastUsedTimestamp = this.playerCooldownTracker.get(playerXuid);

        if (!lastUsedTimestamp || currentTimestamp - lastUsedTimestamp >= BiomeManager.config.cooldown) {
            this.playerCooldownTracker.set(playerXuid, currentTimestamp);
            return { allowed: true };
        }

        // 计算剩余冷却时间
        const remainingSeconds = Math.ceil((BiomeManager.config.cooldown - (currentTimestamp - lastUsedTimestamp)) / 1000);
        return { allowed: false, remainingTime: remainingSeconds };
    }

    createBiomeOptionsChunks() {
        const biomeNames = Array.from(BiomeManager.biomeRegistry.keys());
        const itemsPerPage = BiomeManager.config.ui.itemsPerPage;

        if (!BiomeManager.config.ui.enablePagination) {
            return [biomeNames];
        }

        const chunks = [];
        for (let i = 0; i < biomeNames.length; i += itemsPerPage) {
            chunks.push(biomeNames.slice(i, i + itemsPerPage));
        }
        return chunks;
    }

    // 显示群系选择表单
    displayBiomeSelectionForm(player, pageIndex = 0) {
        const biomeChunks = this.createBiomeOptionsChunks();
        const currentChunk = biomeChunks[pageIndex];
        const totalPages = biomeChunks.length;

        let formOptions = [...currentChunk];
        let formIcons = new Array(currentChunk.length).fill("");

        // 添加翻页按钮
        if (BiomeManager.config.ui.enablePagination && totalPages > 1) {
            if (pageIndex > 0) {
                formOptions.unshift("§b← 上一页");
                formIcons.unshift("");
            }
            if (pageIndex < totalPages - 1) {
                formOptions.push("§b下一页 →");
                formIcons.push("");
            }
        }

        // 显示当前页码信息
        const pageInfo = totalPages > 1 ? ` (第 ${pageIndex + 1}/${totalPages} 页)` : "";

        player.sendSimpleForm(
            `修改岛屿生物群系${pageInfo}`,
            "选择你要修改的群系",
            formOptions,
            formIcons,
            (respondingPlayer, selectedIndex) => this.handleBiomeFormResponse(respondingPlayer, selectedIndex, pageIndex, biomeChunks)
        );
    }

    // 表单
    handleBiomeFormResponse(player, selectedIndex, currentPageIndex, biomeChunks) {

        if (selectedIndex == null) return;

        const currentChunk = biomeChunks[currentPageIndex];
        const hasPrevButton = currentPageIndex > 0;
        const hasNextButton = currentPageIndex < biomeChunks.length - 1;

        let adjustedIndex = selectedIndex;

        if (hasPrevButton) {
            if (selectedIndex == 0) {
                return this.displayBiomeSelectionForm(player, currentPageIndex - 1);
            }
            adjustedIndex--;
        }

        if (hasNextButton && selectedIndex == currentChunk.length + (hasPrevButton ? 1 : 0)) {
            return this.displayBiomeSelectionForm(player, currentPageIndex + 1);
        }

        if (adjustedIndex >= 0 && adjustedIndex < currentChunk.length) {
            this.executeBiomeChange(player, currentChunk[adjustedIndex]);
        }
    }

    executeBiomeChange(player, selectedBiomeName) {

        if (player.islandID !== player.inIsland) return player.sendMsg("§c你必须在自己的岛屿！");

        // 获取岛屿数据
        const islandData = skyblock.Locator.data[player.islandID];

        if (!islandData?.range) return player.sendMsg("§c你还没有岛屿！");


        const [minPos, maxPos] = islandData.range.map(coords => [coords[0], 1, coords[1], 0]);

        const biomeMappingId = BiomeManager.biomeRegistry.get(selectedBiomeName);

        // 修改群系
        fillBiomeAPI(0, new IntPos(...minPos), new IntPos(...maxPos), biomeMappingId, true);

        player.sendMsg(`§a成功将岛屿群系修改为 §e${selectedBiomeName}§a！`);
    }

    showBiomeInterface(player) {

        const cooldownValidation = this.validateCooldown(player.xuid);
        if (!cooldownValidation.allowed) {
            return player.sendMsg(`§c请等待 ${cooldownValidation.remainingTime} 秒后再使用此功能！`);
        }


        if (!skyblock.Locator.data[player.islandID]) return player.sendMsg("§c你还没有岛屿！");

        this.displayBiomeSelectionForm(player);
    }
}


const biomeManagerInstance = BiomeManager.getInstance();


const validatePlayerIslandAccess = (player) => {
    if (!player.islandID || player.islandID !== player.inIsland) {
        player.sendMsg("§c你必须在自己的岛屿上才能使用此功能！");
        return false;
    }
    return true;
};

skyblock.Event.listen("onRegisterCommand", (Enum, cmd, map) => {

    map.push([
        (context) => context.res.biome == "biome",
        (context) => {
            const executingPlayer = context._ori.player;

            if (validatePlayerIslandAccess(executingPlayer)) {
                biomeManagerInstance.showBiomeInterface(executingPlayer);
            }
        }
    ]);

    cmd.setEnum("biome", ["biome"]);

    cmd.mandatory("biome", ParamType.Enum, "biome", 1);

    cmd.overload(["biome"]);
});
