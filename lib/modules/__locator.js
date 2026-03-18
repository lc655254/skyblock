import { Coord } from "plugins/skyblock/lib/modules/__coord.js"

class islandLocator {
    constructor() {
        this.File = new JsonConfigFile('.\\plugins\\skyblock\\data\\data.json', '{}');
        this.ids_file = new JsonConfigFile('.\\plugins\\skyblock\\data\\ids\\ids.json', '{}');
        this.ids_data = this.ids_file.init("data", {});
        this.data = this.File.init("data", {});
        this.dels = this.File.init("dels", {});
        this.state = Coord.state;
        this.cache = {};
    }

    getRandomID() {
        let str;
        do {
            str = system.randomGuid().toUpperCase().substring(0, 16)
        } while (this.data.hasOwnProperty(str))
        return str;
    }

    createIsland(player, blueprint, isSave = true) {
        const id = this.getRandomID()
        const pos = Coord.getNewCoord()
        skyblock.Perms.createPermission(id)
        if (isSave) {
            this.ids_data[player.xuid] = id
        }
        const { x, y, z, type, offset, tag } = blueprint;
        const centerX = Math.floor((pos[0][0] + pos[1][0]) / 2);
        const centerZ = Math.floor((pos[0][1] + pos[1][1]) / 2);
        let reset = this.dels[player.xuid] == null ? 0 : this.dels[player.xuid];
        this.data[id] = {
            name: player.name,
            xuid: player.xuid,
            member: [],
            nickname: "",
            reset: reset,
            range: pos,
            spawn: {}
        }
        this.data[id].spawn[player.xuid] = [centerX - offset[0], y + offset[1], centerZ - offset[2], 0]
        const loadPosX = centerX - Math.floor(x / 2);
        const loadPosZ = centerZ - Math.floor(z / 2);
        player.teleport(centerX, 320, centerZ - 2, 0)
        this.start(player.xuid, () => {
            if (player.pos.y < 320 || mc.getBlock(centerX, 310, centerZ - 2, 0) != null) {
                if (tag) {
                    let SNBT = File.readFrom(`.\\plugins\\skyblock\\structures\\${type}.json`);
                    let nbt = NBT.parseSNBT(SNBT);
                    mc.setStructure(nbt, new IntPos(loadPosX, y, loadPosZ, 0));
                    player.refreshChunks();
                } else {
                    mc.runcmdEx(`structure load ${type} ${loadPosX} ${y} ${loadPosZ}`)
                }
                player.teleport(...this.data[id].spawn[player.xuid])
                this.stop(player.xuid)
                player.setRespawnPosition(...this.data[id].spawn[player.xuid])
                skyblock.Event.$emit("onCreateIsland", [player, id, blueprint.type]);
                this.updata();
            }
        }, 100)
        return id
    }

<<<<<<< HEAD
    deleteIsland(player, isplayer = true, clearInventory = true) {
        const id = player.islandID;
        if (!id) return false;
        const islandData = this.data[id];
        if (!islandData) return false;
        const members = islandData.member || [];

        // ===== 清理岛屿区域（仅方块）=====
        const range = islandData.range;
        if (range && Array.isArray(range) && range.length === 2) {
            const [pos1, pos2] = range;
            const minX = Math.min(pos1[0], pos2[0]);
            const maxX = Math.max(pos1[0], pos2[0]);
            const minZ = Math.min(pos1[1], pos2[1]);
            const maxZ = Math.max(pos1[1], pos2[1]);
            const minY = 0;      // 兼容旧版世界
            const maxY = 255;    // 兼容旧版世界

            const chunkSize = 8;
            for (let x = minX; x <= maxX; x += chunkSize) {
                for (let z = minZ; z <= maxZ; z += chunkSize) {
                    const subMinX = x;
                    const subMaxX = Math.min(x + chunkSize - 1, maxX);
                    const subMinZ = z;
                    const subMaxZ = Math.min(z + chunkSize - 1, maxZ);
                    mc.runcmd(`fill ${subMinX} ${minY} ${subMinZ} ${subMaxX} ${maxY} ${subMaxZ} air`);
                }
            }
        }

=======
<<<<<<< Updated upstream

    deleteIsland(player, isplayer = true) {
        const id = player.islandID;
        // 获取成员列表（在删除数据前）
        const members = this.data[id]?.member || [];

        if (isplayer) {
            skyblock.Event.$emit("onDeleteIsland", [player, id, members]); // 传递成员列表
            if (this.dels[player.xuid] == null) {
                this.dels[player.xuid] = 1;
            } else {
                this.dels[player.xuid]++;
            }
            delete this.ids_data[player.xuid];
        }

        // 清理所有成员的 ids_data（避免残留）
=======
    deleteIsland(player, isplayer = true, clearInventory = true) {
        const id = player.islandID;
        if (!id) return false;
        const islandData = this.data[id];
        if (!islandData) return false;
        const members = islandData.member || [];

        // ===== 清理岛屿区域（仅方块）=====
        const range = islandData.range;
        if (range && Array.isArray(range) && range.length === 2) {
            const [pos1, pos2] = range;
            const minX = Math.min(pos1[0], pos2[0]);
            const maxX = Math.max(pos1[0], pos2[0]);
            const minZ = Math.min(pos1[1], pos2[1]);
            const maxZ = Math.max(pos1[1], pos2[1]);
            const minY = 0;      // 兼容旧版世界
            const maxY = 255;    // 兼容旧版世界

            const chunkSize = 8;
            for (let x = minX; x <= maxX; x += chunkSize) {
                for (let z = minZ; z <= maxZ; z += chunkSize) {
                    const subMinX = x;
                    const subMaxX = Math.min(x + chunkSize - 1, maxX);
                    const subMinZ = z;
                    const subMaxZ = Math.min(z + chunkSize - 1, maxZ);
                    mc.runcmd(`fill ${subMinX} ${minY} ${subMinZ} ${subMaxX} ${maxY} ${subMaxZ} air`);
                }
            }
        }

>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
        // ===== 清理在线成员的背包 =====
        if (clearInventory) {
            this._clearPlayerInventory(player);
            members.forEach(xuid => {
                const memberPlayer = mc.getPlayer(xuid);
                if (memberPlayer) {
                    this._clearPlayerInventory(memberPlayer);
                }
            });
        }

        // ===== 触发事件并清理数据 =====
        if (isplayer) {
            skyblock.Event.$emit("onDeleteIsland", [player, id, members]);
            if (this.dels[player.xuid] == null) {
                this.dels[player.xuid] = 1;
            } else {
                this.dels[player.xuid]++;
            }
            delete this.ids_data[player.xuid];
        }

<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
        members.forEach(xuid => {
            delete this.ids_data[xuid];
        });

        delete this.data[id];
        skyblock.Perms.removePermission(id);
        this.updata();
        return true;
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
=======
>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
    }

    _clearPlayerInventory(player) {
        if (!player || typeof player.getInventory !== 'function') return;
        const inv = player.getInventory();
        const slots = inv.getAllItems();
        for (let i = 0; i < slots.length; i++) {
            const item = slots[i];
            if (item && item.type !== 'minecraft:clock') {
                inv.removeItem(i, item.count);
            }
        }
        const armor = player.getArmor();
        if (armor) {
            const armorSlots = armor.getAllItems();
            for (let i = 0; i < armorSlots.length; i++) {
                const item = armorSlots[i];
                if (item && item.type !== 'minecraft:clock') {
                    armor.removeItem(i, item.count);
                }
            }
        }
        player.refreshItems();
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
    }

    addKeyToObject(obj, key) {
        const newObj = { ...obj }
        newObj[key] = Object.values(obj)[0]
        return newObj
    }

    addMember(player, id) {
        if (player.islandID) {
<<<<<<< HEAD
            this.deleteIsland(player, true, false);
=======
<<<<<<< Updated upstream
            this.deleteIsland(player);
=======
            this.deleteIsland(player, true, false);
>>>>>>> Stashed changes
>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
        }
        this.ids_data[player.xuid] = id;
        this.data[id].member.push(player.xuid);
        this.data[id].spawn = this.addKeyToObject(this.data[id].spawn, [player.xuid]);
        this.updata();
<<<<<<< HEAD
        player.teleport(...player.skyblockSpawn);
=======
<<<<<<< Updated upstream

        // 确保 spawn 存在后再传送
        const spawnPos = player.skyblockSpawn;
        if (spawnPos) {
            player.teleport(...spawnPos);
        }
=======
        player.teleport(...player.skyblockSpawn);
>>>>>>> Stashed changes
>>>>>>> 4620eb832a2d3ba8d2c556396ede34be69eeefae
    }

    removeMember(id, name) {
        const xuid = data.name2xuid(name)
        this.data[id].member.splice(this.data[id].member.indexOf(xuid), 1)
        delete this.data[id].spawn[xuid]
        delete this.ids_data[xuid]
        this.updata();
    }

    setIslandData(id, key, data) {
        this.data[id][key] = data;
        this.updata();
    }

    updata() {
        this.ids_file.set("data", this.ids_data)
        this.File.set("data", this.data);
        this.File.set("dels", this.dels);
    }

    start(key, func, interval) {
        if (this.cache[key]) {
            this.stop(key);
        }
        const timer = setInterval(func, interval);
        this.cache[key] = timer;
    }

    stop(key) {
        if (this.cache[key]) {
            clearInterval(this.cache[key]);
            delete this.cache[key];
        }
    }

    convertIslandData(name, xuid, range, height) {
        const id = this.getRandomID()
        const pos = range
        this.ids_data[xuid] = id
        skyblock.Perms.createPermission(id)
        const centerX = Math.floor((pos[0][0] + pos[1][0]) / 2);
        const centerZ = Math.floor((pos[0][1] + pos[1][1]) / 2);
        this.data[id] = {
            name: name,
            xuid: xuid,
            member: [],
            nickname: "",
            reset: 0,
            range: pos,
            spawn: {}
        }
        this.data[id].spawn[xuid] = [centerX, height, centerZ, 0]
        this.updata();
    }

    convertPos(num) {
        for (let i = 0; i < num; i++) {
            Coord.getNewCoord()
        }
    }

    checkIntersection(newRectangle) {
        let rectangles = Object.values(this.data).map(({ range }) => range);
        for (const [rectangleStart, rectangleEnd] of rectangles) {
            const [newStartX, newStartY] = newRectangle[0];
            const [newEndX, newEndY] = newRectangle[1];
            const [rectStartX, rectStartY] = rectangleStart;
            const [rectEndX, rectEndY] = rectangleEnd;
            if (
                Math.max(newStartX, newEndX) >= Math.min(rectStartX, rectEndX) &&
                Math.min(newStartX, newEndX) <= Math.max(rectStartX, rectEndX) &&
                Math.max(newStartY, newEndY) >= Math.min(rectStartY, rectEndY) &&
                Math.min(newStartY, newEndY) <= Math.max(rectStartY, rectEndY)
            ) {
                return false;
            }
        }
        return true;
    }

    filterB() {
        const newB = Object.fromEntries(
            Object.entries(this.data).filter(([key]) => valuesInA.has(key))
        );
        this.ids_file.set("data", this.ids_data)
        this.File.set("data", newB);
    }
}

const Locator = new islandLocator();
export { Locator }
