//
// Table Rolls (Generic)
// by Viriato139ac
//

const macroName = "Table Rolls";
const macroVersion = "1.0";
const macroImage = "icons/sundries/gaming/chess-pawn-gray.webp";

const rollArray = [
  { name: "publicroll", desc: `${game.i18n.localize("CHAT.RollPublic")}` },
  { name: "gmroll", desc: `${game.i18n.localize("CHAT.RollPrivate")}` },
  { name: "blindroll", desc: `${game.i18n.localize("CHAT.RollBlind")}` },
  { name: "selfroll", desc: `${game.i18n.localize("CHAT.RollSelf")}` },
];
const rollOptions = rollArray.reduce(
  (a, b) => (a += `<option value="${b.name}">${b.desc}</option>`),
  ``
);

const myDialogOptions = {
  width: 640,
  //height: 800,
  //top: 500,
  //left: 500
};

tableRolls();

function tableRolls() {
  const tableOptions = game.tables
    .filter((a) => a.permission > 0)
    .reduce(
      (a, b) => (a += `<option value="${b.name}">${b.name}</option>`),
      ``
    );

  const content = `
  <form>
  <style type="text/css">
  .tg  {border-collapse:collapse;border-color:#ccc;border-spacing:0;}
  .tg td{background-color:#fff;border-color:#ccc;border-style:solid;border-width:1px;color:#333;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:2px 2px;word-break:normal;}
  .tg .tg-bzmm{background-color:#556b2f;border-color:#ffffff;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
  .tg .tg-d6y8{border-color:#efefef;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
  .tg .tg-ly6r{border-color:#efefef;text-align:left;vertical-align:middle}
  .tg .tg-r5a9{background-color:#556b2f;border-color:#efefef;color:#ffffff;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
  .tg .tg-049l{background-color:#f0f0f0;border-color:#efefef;font-family:"Courier New", Courier, monospace !important;;font-size:12px;text-align:left;vertical-align:middle}  
  </style>
  <table class="tg">
    <tr>
    <td class="tg-r5a9" colspan="4">${game.i18n.localize(
      "DG.scripts.tableRolls.title"
    )}</td>    
    </tr>
    <tr>
    <td class="tg-d6y8" colspan="1">${game.i18n.localize(
      "DG.scripts.tableRolls.table"
    )}</td>
    <td class="tg-d6y8" colspan="3" style="font-weight: bold;"><select name="selectedTable">${tableOptions}</select></td>
    </tr>
    <tr>
    <td class="tg-d6y8" colspan="1">${game.i18n.localize(
      "DG.scripts.tableRolls.rollas"
    )}</td>
    <td class="tg-d6y8" colspan="3" style="font-weight: bold;"><select name="selectedRoll">${rollOptions}</select></td>
    </tr>
    </table>
    </form>`;

  new Dialog(
    {
      title:
        `${game.i18n.localize("DG.scripts.tableRolls.title")}` +
        ` v` +
        macroVersion,
      content,
      buttons: {
        play: {
          label: `${game.i18n.localize("DG.scripts.general.roll")}`,
          callback: async (html) => {
            const selectedTable = html.find(`[name="selectedTable"]`).val();
            const selectedRoll = html.find(`[name="selectedRoll"]`).val();
            let rm = game.settings.get("core", "rollMode");
            game.settings.set("core", "rollMode", selectedRoll);
            const table = game.tables.getName(selectedTable);
            let charRoll = await new Roll(table.formula);
            //charRoll.roll();
            await charRoll.evaluate();
            let flavourString = `${game.i18n.format(
              "DG.scripts.tableRolls.tableFlavour",
              {
                tableName: table.name,
              }
            )}`;
            let contentString = `
              <table class="dgTable">
              <thead>
              <tr>
                <th>${game.i18n.localize("DG.scripts.tableRolls.table")}</th>
                <th>${game.i18n.localize("DG.scripts.tableRolls.formula")}</th>
                <th>${game.i18n.localize("DG.scripts.general.result")}</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>${table.name}</td>
                <td>${table.formula}</td>
                <td>${charRoll.result}</td>
              </tr>
			  <tr>
                <td colspan="3">${table.getResultsForRoll(charRoll.result)[0].name}</td>
              </tr>
			  <tr>
                <td colspan="3">${table.getResultsForRoll(charRoll.result)[0].description}</td>
              </tr>
              </tbody>
              </table>
              
              `;

            charRoll.toMessage({
              user: game.user.id,
              speaker: ChatMessage.getSpeaker(),
              flavor: flavourString,
              content: contentString,
            });
            game.settings.set("core", "rollMode", rm);
          },
        },
        cancel: {
          label: `${game.i18n.localize("DG.scripts.general.cancel")}`,
          callback: (html) => console.log("Cancelled"),
        },
      },
      default: "play",
    },
    myDialogOptions
  ).render(true);
}
