

class IslandMenu {

    static Form(player) {

        let fm = mc.newSimpleForm().setTitle("岛屿菜单");

        fm.addButton("返回岛屿", "textures/ui/icon_recipe_nature");

        fm.addButton("岛屿重生点", "textures/ui/sidebar_icons/realms");

        fm.addButton("岛屿挑战", "textures/ui/sidebar_icons/genre");

        fm.addButton("岛屿设置", "textures/ui/icon_setting");

        player.sendForm(fm, (player, id) => {

            if (id == null) return;

            switch (id) {
                case 0:
                    player.runcmd("is spawn");
                    break;
                case 1:
                    this.islandWarp(player);
                    break;
                case 2:
                    player.runcmd("challenges");
                    break;
                case 3:
                    this.islandSet(player);
                    break;
                default:
                    break;
            }

        })

    }

    static islandWarpSet(player) {

        let fm = mc.newSimpleForm().setTitle("空岛菜单")

        fm.addButton("设置岛屿出生点");

        fm.addButton("§l返回上一级");

        player.sendForm(fm, (player, id) => {

            if (id == null) return false

            switch (id) {
                case 0:
                    player.runcmd("is set spawn")
                    break;
                case 1:
                    this.islandWarp(player);
                    break;
                default:
                    break;
            }

        })


    }

    static islandSet(player) {

        let fm = mc.newSimpleForm().setTitle("空岛菜单")

        fm.addButton("设置岛屿权限");

        fm.addButton("删除岛屿");

        fm.addButton("§l返回上一级");

        player.sendForm(fm, (player, id) => {

            if (id == null) return false

            switch (id) {
                case 0:
                    player.runcmd("is set perms")
                    break;
                case 1:
                    player.runcmd("is delete")
                    break;
                case 2:
                    this.Form(player);
                    break;
                default:
                    break;
            }

        })


    }

}


/*这里没必要写菜单触发
function debounce(func, delay) {
    let timeoutId = null;

    return function (...args) {

        if (timeoutId) {
            clearInterval(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedonUseItem = debounce((player, item) => {

    if (item?.type == "minecraft:clock") player.runcmd("is")

}, 200);



mc.listen("onUseItem", (player, item) => {

    debouncedonUseItem(player, item)

})

mc.listen("onAttackBlock", (player, block, item) => {

    if (item?.type == "minecraft:clock") player.runcmd("is")

})
*/

skyblock.Event.listen("onExecuteSkyCommandIs", (context) => IslandMenu.Form(context._ori.player))

// 进服给钟  依旧祖传代码

mc.listen("onJoin", (player) => {

    const hasClock = player.getInventory().getAllItems().some(item => item.type === "minecraft:clock");

    if (!hasClock) {

        const clock = mc.newItem(NBT.parseSNBT(`{"Count":1b,"Damage":0s,"Name":"minecraft:clock","WasPickedUp":0b,"tag":{"minecraft:item_lock":2b,"minecraft:keep_on_death":1b,"display":{"Name":"§l§e菜单"}}}`));

        player.giveItem(clock);

    }
}

)
