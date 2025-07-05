//
// Skill Rolls (deltagreen)
// by Viriato139ac
//

const macroName = "Skill Rolls";
const macroVersion = "1.0";
const macroImage = "icons/sundries/gaming/chess-rook-gray.webp";

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

const typeArray = [
  {
    name: "skill",
    desc: `${game.i18n.localize("DG.scripts.skillRolls.skill")}`,
  },
  { name: "stat", desc: `${game.i18n.localize("DG.scripts.skillRolls.stat")}` },
];

const typeOptions = typeArray.reduce(
  (a, b) => (a += `<option value="${b.name}">${b.desc}</option>`),
  ``
);

const activeOptions = Array.from(canvas.tokens.controlled).reduce(
  (a, b) =>
    (a += `<option value="${game.actors.get(b.document.actorId).name}">${
      game.actors.get(b.document.actorId).name
    }</option>`),
  ``
);

const myDialogOptions = {
  width: 640,
  resizable: true,
  //height: 800,
  //top: 500,
  //left: 500
};

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
  <td class="tg-r5a9" colspan="2">${game.i18n.localize(
    "DG.scripts.general.actor"
  )}</td>
  <td class="tg-r5a9" colspan="2">${game.i18n.localize(
    "DG.scripts.general.type"
  )}</td>
  <td class="tg-r5a9" colspan="5">${game.i18n.localize(
    "DG.scripts.general.ability"
  )}</td>
  <td class="tg-r5a9" colspan="1">${game.i18n.localize(
    "DG.scripts.general.modifier"
  )}</td>
  </tr>
  <tr>
  <td class="tg-d6y8" colspan="2" style="font-weight: bold;"><select name="activeActor">${activeOptions}</select></td>
  <td class="tg-d6y8" colspan="2" style="font-weight: bold;"><select name="activeType">${typeOptions}</select></td>
  <td class="tg-d6y8" colspan="5"><select name="activeName"></select></td>
  <td class="tg-d6y8" colspan="1"><input type="number" id="activeMod" name="activeMod" value=0></td>
  </tr>
  </table>
  </form>`;

skillRolls();

function skillRolls() {
  if (canvas.tokens.controlled.length === 0) {
    ui.notifications.error(
      `${game.i18n.localize("DG.scripts.general.errorselect")}`
    );
    return;
  }

  new Dialog(
    {
      title:
        `${game.i18n.localize("DG.scripts.skillRolls.title")}` +
        ` v` +
        macroVersion,
      content,
      buttons: {
        roll: {
          label: `${game.i18n.localize("DG.scripts.general.roll")}`,
          callback: async (html) => {
            const activeName = html.find(`[name="activeName"]`).val();
            const activeType = html.find(`[name="activeType"]`).val();
            const activeActor = html.find(`[name="activeActor"]`).val();
            const activeMod = html.find(`[name="activeMod"]`).val();
			const activeNameLoc = activeType === "stat" ? game.i18n.localize('DG.Attributes.' + activeName) : game.i18n.localize('DG.Skills.' + activeName);
			
            let activeBase;
            if (activeType === "stat") {
              activeBase =
                game.actors.getName(activeActor).system.statistics[activeName]
                  .value * 5;
            } else {
              activeBase = game.actors.getName(activeActor).system.skills[
                activeName
              ]
                ? game.actors.getName(activeActor).system.skills[activeName]
                    .proficiency
                : game.actors.getName(activeActor).system.typedSkills[
                    activeName
                  ].proficiency;
            }
            let activeValue = Math.max(1, activeBase * 1 + activeMod * 1);

            let activeRoll = new Roll("1d100");
            await activeRoll.evaluate();
            let activeResult = nivelexito(activeRoll.result, activeValue);
            console.log(
              "active: Rolled " +
                activeRoll.result +
                " on " +
                activeValue +
                " Result: " +
                lvlNames[activeResult]
            );

            let activeLabel =
              `<span style="font-weight: bold; color:` +
              lvlColours[activeResult] +
              `;">` +
              lvlNames[activeResult] +
              `</span>`;

            let activeFlavour = `${game.i18n.format(
              "DG.scripts.skillRolls.activeFlavour",
              {
                activeName: activeNameLoc,
                activeBase: activeBase,
              }
            )}`;
            let activeString = `
            <table class="dgTable">
            <thead>
			<tr>
              <th>${game.i18n.localize("DG.scripts.general.actor")}</th>
              <th>${game.i18n.localize("DG.scripts.general.base")}</th>
              <th>${game.i18n.localize("DG.scripts.general.mod")}</th>
              <th>${game.i18n.localize("DG.scripts.general.rollp")}</th>
              <th>${game.i18n.localize("DG.scripts.general.result")}</th> 
            </tr>
			</thead>
			<tbody>
            <tr>
              <td>${activeActor}</td>
              <td>${activeBase}</td>
              <td>${activeMod}</td>
              <td>${activeRoll.result} (${activeValue})</td>
              <td>${activeLabel}</td>
            </tr>
			</tbody>
            </table>
			`;
            activeRoll.toMessage({
              user: game.user.id,
              speaker: ChatMessage.getSpeaker(),
              flavor: activeFlavour,
              content: activeString,
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
  const firstactiveOptions_stats = Object.getOwnPropertyNames(
    game.actors.getName($("select[name=activeActor]")[0].value).system
      .statistics
  ).reduce(
    (acc, e) =>
      (acc += `<option value="${e}">${game.i18n.localize(
        "DG.Attributes." + e
      )}</option>`),
    ``
  );
  const firstactiveOptions_skills = Object.getOwnPropertyNames(
    game.actors.getName($("select[name=activeActor]")[0].value).system.skills
  ).reduce(
    (acc, e) =>
      (acc += `<option value="${e}">${game.i18n.localize(
        "DG.Skills." + e
      )}</option>`),
    ``
  );
  const firstactiveOptions_typedSkills = Object.entries(
    game.actors.getName($("select[name=activeActor]")[0].value).system
      .typedSkills
  ).reduce(
    (acc, e) =>
      (acc += `<option value="${e[0]}">${game.i18n.localize(
        "DG.TypeSkills." + e[1].group
      )} (${e[1].label})</option>`),
    ``
  );
  const firstactiveOptions =
    $("select[name=activeType]")[0].value === "stat"
      ? firstactiveOptions_stats
      : firstactiveOptions_skills + firstactiveOptions_typedSkills;
  $("select[name=activeName]").append(firstactiveOptions);
  $("select[name=activeType]").change(function () {
    const newactiveOptions_stats = Object.getOwnPropertyNames(
      game.actors.getName($("select[name=activeActor]")[0].value).system
        .statistics
    ).reduce(
      (acc, e) =>
        (acc += `<option value="${e}">${game.i18n.localize(
          "DG.Attributes." + e
        )}</option>`),
      ``
    );
    const newactiveOptions_skills = Object.getOwnPropertyNames(
      game.actors.getName($("select[name=activeActor]")[0].value).system.skills
    ).reduce(
      (acc, e) =>
        (acc += `<option value="${e}">${game.i18n.localize(
          "DG.Skills." + e
        )}</option>`),
      ``
    );
    const newactiveOptions_typedSkills = Object.entries(
      game.actors.getName($("select[name=activeActor]")[0].value).system
        .typedSkills
    ).reduce(
      (acc, e) =>
        (acc += `<option value="${e[0]}">${game.i18n.localize(
          "DG.TypeSkills." + e[1].group
        )} (${e[1].label})</option>`),
      ``
    );
    const newactiveOptions =
      $("select[name=activeType]")[0].value === "stat"
        ? newactiveOptions_stats
        : newactiveOptions_skills + newactiveOptions_typedSkills;
    $("select[name=activeName]").empty();
    $("select[name=activeName]").append(newactiveOptions);
  });
});
