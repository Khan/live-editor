/* eslint-disable no-undef */
/* TODO: Fix the lint errors */
/* To fix, remove an entry above, npm run lint, and fix errors. */

if (!i18n._) {
    i18n._ = function(msg) {
        return msg;
    };
}

// The master list of acceptable sounds
// Build a list of all the available sounds
// TODO(kevinb) add methods to help query for sounds
const OutputSounds = [{
    className: "Sound effects",
    groups: [{
        groupName: "rpg",
        sounds: "battle-magic battle-spell battle-swing coin-jingle door-open giant-hyah giant-no giant-yah hit-clop hit-splat hit-thud hit-whack metal-chime metal-clink step-heavy water-bubble water-slosh".split(" "),
        cite: i18n._("'RPG Sound Effects' sounds by artisticdude"),
        citeLink: "http://opengameart.org/content/rpg-sound-pack"
    },
    {
        groupName: "retro",
        sounds: "boom1 boom2 coin hit1 hit2 jump1 jump2 laser1 laser2 laser3 laser4 rumble thruster-short thruster-long whistle1 whistle2".split(" "),
        cite: i18n._("'Retro Game Sounds' sounds by spongejr"),
        citeLink: "https://www.khanacademy.org/profile/spongejr/"
    }]
}];

module.exports = OutputSounds;
