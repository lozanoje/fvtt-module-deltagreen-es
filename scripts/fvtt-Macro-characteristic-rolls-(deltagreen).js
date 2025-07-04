//
// Characteristic Rolls (deltagreen)
// by Viriato139ac
//

const macroName = "Characteristic Rolls";
const macroVersion = "1.0";
const macroImage = "icons/sundries/gaming/chess-knite-gray.webp";

function nivelexito(diceResult, skillLevel) {
  const decs = Math.floor(diceResult / 10);
  const units = diceResult - decs * 10;
  let critical = decs === units;
  let levelResult = 4;
  if (diceResult <= skillLevel) {
    levelResult = critical | (diceResult === 1) ? 0 : 1;
  } else {
    levelResult = critical | (diceResult === 100) ? 3 : 2;
  }
  return levelResult;
}

const lvlColours = ["goldenrod", "green", "red", "darkred"];

const lvlNames = [
  `${game.i18n.localize("DG.Roll.CriticalSuccess")}`,
  `${game.i18n.localize("DG.Roll.Success")}`,
  `${game.i18n.localize("DG.Roll.Failure")}`,
  `${game.i18n.localize("DG.Roll.CriticalFailure")}`,
];

const rollMultipliers = [
  {
    mult: 5,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.1"
    )}`,
  },
  {
    mult: 4,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.2"
    )}`,
  },
  {
    mult: 3,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.3"
    )}`,
  },
  {
    mult: 2,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.4"
    )}`,
  },
  {
    mult: 1,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.5"
    )}`,
  },
  {
    mult: 0.5,
    desc: `${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficultyEnum.6"
    )}`,
  },
];

const myDialogOptions = {
  width: 640,
  resizable: true,
  //height: 800,
  //top: 500,
  //left: 500
};

const statistics = {
  str: `${game.i18n.localize("DG.Attributes.str")}`,
  con: `${game.i18n.localize("DG.Attributes.con")}`,
  dex: `${game.i18n.localize("DG.Attributes.dex")}`,
  int: `${game.i18n.localize("DG.Attributes.int")}`,
  pow: `${game.i18n.localize("DG.Attributes.pow")}`,
  cha: `${game.i18n.localize("DG.Attributes.cha")}`,
};

characteristicRolls();

function characteristicRolls() {
  if (canvas.tokens.controlled.length === 0) {
    ui.notifications.error(
      `${game.i18n.localize("DG.scripts.general.errorselect")}`
    );
    return;
  }

  const charOptions = Object.getOwnPropertyNames(
    token.actor.system.statistics
  ).reduce(
    (a, b) => (a += `<option value="${b}">` + statistics[`${b}`] + `</option>`),
    ``
  );

  const multOptions = rollMultipliers.reduce(
    (a, b) => (a += `<option value="${b.mult}">${b.desc}</option>`),
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
    <td class="tg-r5a9" colspan="3">${game.i18n.localize(
      "DG.scripts.general.characteristic"
    )}</td>
    <td class="tg-r5a9" colspan="1">${game.i18n.localize(
      "DG.scripts.general.value"
    )}</td>
    <td class="tg-r5a9" colspan="3">${game.i18n.localize(
      "DG.scripts.characteristicRolls.difficulty"
    )}</td>
    <td class="tg-r5a9" colspan="1">${game.i18n.localize(
      "DG.scripts.general.modifier"
    )}</td>
    </tr>
    <tr>
    <td class="tg-d6y8" colspan="3" style="font-weight: bold;"><select name="charNam">${charOptions}</select></td>
    <td class="tg-d6y8" colspan="1"><input type="number" id="charVal" name="charVal" value=0></td>
    <td class="tg-d6y8" colspan="3" style="font-weight: bold;"><select name="charMul">${multOptions}</select></td>
    <td class="tg-d6y8" colspan="1"><input type="number" id="charMod" name="charMod" value=0></td>
    </tr>
    </table>
    </form>`;

  new Dialog(
    {
      title:
        `${game.i18n.localize("DG.scripts.characteristicRolls.title")}` +
        ` v` +
        macroVersion,
      content,
      buttons: {
        roll: {
          label: `${game.i18n.localize("DG.scripts.general.roll")}`,
          callback: async (html) => {
            const charNam = html.find(`[name="charNam"]`).val();
            const charVal = html.find(`[name="charVal"]`).val();
            const charMod = html.find(`[name="charMod"]`).val();
            const charMul = html.find(`[name="charMul"]`).val();

            let charValue = Math.max(1, charVal * charMul + charMod * 1);
            let charRoll = new Roll("1d100");
            //charRoll.roll();
            await charRoll.evaluate();
            let charResult = nivelexito(charRoll.result, charValue);

            console.log(
              "char: Rolled " +
                charRoll.result +
                " on " +
                charValue +
                " Result: " +
                lvlNames[charResult]
            );

            let charLabel =
              `<span style="font-weight: bold; color:` +
              lvlColours[charResult] +
              `;">` +
              lvlNames[charResult] +
              `</span>`;

            let flavourString = `${game.i18n.format(
              "DG.scripts.characteristicRolls.flavourString",
              {
                charNam: statistics[`${charNam}`],
                charVal: charVal,
                charMul: charMul,
                charRoll: charRoll.result,
                charValue: charValue,
                charLabel: charLabel,
              }
            )}`;
            // let flavourString = `Rolling <span style="font-weight: bold;color: brown">${charNam} (${charVal} x ${charMul})</span>. Rolled ${charRoll.result}% on a modified probability of ${charValue}%, a ${charLabel}`;
            let contentString = `<table>
              <tr>
                  <th colspan="1">${game.i18n.localize("DG.scripts.general.value")}</th>
                  <th colspan="1">${game.i18n.localize("DG.scripts.general.mod")}</th>
                  <th colspan="1">${game.i18n.localize("DG.scripts.general.rollp")}</th>
                  <th colspan="1">${game.i18n.localize("DG.scripts.general.result")}</th> 
              </tr>
              <tr>
              <td colspan="1" style="text-align: center; vertical-align: middle;">${charVal} (x${charMul})</td>
              <td colspan="1" style="text-align: center; vertical-align: middle;">${charMod}</td>
              <td colspan="1" style="text-align: center; vertical-align: middle; font-weight: bold;">${charRoll.result} (${charValue})</td>
              <td colspan="1" style="text-align: center; vertical-align: middle; font-weight: bold;">${charLabel}</td>
              </tr>
              </table>`;

            charRoll.toMessage({
              user: game.user.id,
              speaker: ChatMessage.getSpeaker(),
              flavor: flavourString,
              content: contentString,
            });
          },
        },
        cancel: {
          label: `${game.i18n.localize("DG.scripts.general.cancel")}`,
          callback: (html) => console.log("Cancelled"),
        },
      },
      default: "roll",
    },
    myDialogOptions
  ).render(true);
}

await new Promise((resolve) => setTimeout(resolve, 250));
$(document).ready(function () {
  const firstcharOptions =
    token.actor.system.statistics[$("select[name=charNam]")[0].value].value;
  console.log(
    "R: " + $("select[name=charNam]")[0].value + ": " + firstcharOptions
  );
  $("input[name=charVal]").val(firstcharOptions);
  $("select[name=charNam]").change(function () {
    const newcharOptions =
      token.actor.system.statistics[$("select[name=charNam]")[0].value].value;
    console.log(
      "C: " + $("select[name=charNam]")[0].value + ": " + newcharOptions
    );
    $("input[name=charVal]").val(newcharOptions);
  });
});
