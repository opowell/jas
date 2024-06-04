import Weapon from "./Weapon.js"
import { randomElement } from "./utils.js"

//  	/* Name		 CARRY	FLAG    str, exp, lvl, amr, hpt, dmg */
// 395 	{ "aquator",	0,	ISMEAN,	{ XX, 20,   5,   2, ___, "0d0/0d0" } },
// 396 	{ "bat",	 	0,	ISFLY,	{ XX,  1,   1,   3, ___, "1d2" } },
// 397 	{ "centaur",	 15,	0,	{ XX, 25,   4,   4, ___, "1d6/1d6" } },
// 398 	{ "dragon",	 100,	ISMEAN,	{ XX,6800, 10,  -1, ___, "1d8/1d8/3d10" } },
// 399 	{ "emu",	 0,	ISMEAN,	{ XX,  2,   1,   7, ___, "1d2" } },
// 400 		/* NOTE: the damage is %%% so that xstr won't merge this */
// 401 		/* string with others, since it is written on in the program */
// 402 	{ "venus flytrap",0,	ISMEAN,	{ XX, 80,   8,   3, ___, "%%%d0" } },
// 403 	{ "griffin",	 20,	ISMEAN|ISFLY|ISREGEN,	{XX,2000, 13, 2,___, "4d3/3d5/4d3" } },
// 404 	{ "hobgoblin",	 0,	ISMEAN,	{ XX,  3,   1,   5, ___, "1d8" } },
// 405 	{ "ice monster", 0,	ISMEAN,	{ XX,  15,   1,   9, ___, "1d2" } },
// 406 	{ "jabberwock",  70,	0,	{ XX,4000, 15,   6, ___, "2d12/2d4" } },
// 407 	{ "kestral",	 0,	ISMEAN|ISFLY, { XX,  1,   1,   7, ___, "1d4" } },
// 408 	{ "leprechaun",	 ISGREED,	0,	{ XX, 10,   3,   8, ___, "1d2" } },
// 409 	{ "medusa",	 40,	ISMEAN,	{ XX,200,   8,   2, ___, "3d4/3d4/2d5" } },
// 410 	{ "nymph",	 100,	0,	{ XX, 37,   3,   9, ___, "0d0" } },
// 411 	{ "orc",	 15,	ISGREED,{ XX,  5,   1,   6, ___, "1d8" } },
// 412 	{ "phantom",	 0,ISINVIS,{ XX,120,   8,   3, ___, "4d4" } },
// 413 	{ "quagga",	 30,	ISMEAN,	{ XX, 32,   3,   2, ___, "1d2/1d2/1d4" } },
// 414 	{ "rattlesnake", 0,	ISMEAN,	{ XX,  9,   2,   3, ___, "1d6" } },
// 415 	{ "slime",	 	 0,	ISMEAN,	{ XX,  1,   2,   8, ___, "1d3" } },
// 416 	{ "troll",	 50,	ISREGEN|ISMEAN,{ XX, 120, 6, 4, ___, "1d8/1d8/2d6" } },
// 417 	{ "ur-vile",	 0,	ISMEAN,	{ XX,190,   7,  -2, ___, "1d3/1d3/1d3/4d6" } },
// 418 	{ "vampire",	 20,	ISREGEN|ISMEAN,{ XX,350,   8,   1, ___, "1d10" } },
// 419 	{ "wraith",	 0,	0,	{ XX, 55,   5,   4, ___, "1d6" } },
// 420 	{ "xeroc",30,	0,	{ XX,100,   7,   7, ___, "3d4" } },
// 421 	{ "yeti",	 30,	0,	{ XX, 50,   4,   6, ___, "1d6/1d6" } },
// 422 	{ "zombie",	 0,	ISMEAN,	{ XX,  6,   2,   8, ___, "1d8" } }
const DEFINITIONS = {
  MACE: {
    name: 'mace',
    prob: 0.6,
    damage: '2d4'
  },
  LONG_SWORD: {
    name: 'long sword',
    prob: 0.3,
    damage: '3d4'
  },
  TWO_HANDED_SWORD: {
    name: 'two-handed sword',
    prob: 0.1,
    damage: '4d4'
  },
  SHORT_BOW: {
    name: 'short bow',
    prob: 1,
    damage: '1d1'
  },
  DAGGER: {
    name: 'dagger',
    prob: 1,
    damage: '1d4'
  },
  DART: {
    name: 'dart',
    prob: 1,
    damage: '1d4'
  },
  CROSSBOW: {
    name: 'crossbow',
    prob: 1,
    damage: '1d4'
  },
  CROSSBOW_BOLT: {
    name: 'crossbow bolt',
    prob: 1,
    damage: '1d4'
  },
  SPEAR: {
    name: 'spear',
    prob: 1,
    damage: '1d4'
  },
  ARROW: {
    name: 'arrow',
    prob: 1,
    damage: '1d4'
  }
}

export const getWeapon = (weaponType) => {
  if (!weaponType) {
    weaponType = randomElement(DEFINITIONS, def => def.prob)
  }
  return new Weapon(weaponType)
}

export const spawnMace = () => {
  return new Weapon(DEFINITIONS.MACE)
}
