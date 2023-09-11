const fourDirections = ([name, frames]: [string, number]): [string, number][] => {
	return ['', 'left', 'up', 'down'].map(dir => [name + dir, frames])
}

export const animations: Record<characters, [string, number][]> = {
	MiniPrinceMan: [['idle', 4], ['run', 6], ['hit', 3], ['jump', 6], ['death', 6], ['attack', 6]],
	MiniGoblin: [['idle', 4], ['run', 6], ['jump', 3], ['attack', 4], ['attack2', 4], ['hit', 2], ['death', 2]],
	MiniGoblinThief: [['idle', 4], ['run', 6], ['jump', 3], ['attack', 4], ['attack2', 4], ['hit', 2], ['death', 2]],
	// MinifantasyCreaturesHumanBaseAnimations: ['', '-left', '-up', '-down'],
	Minifantasy_CreaturesHumanBaseAnimations: [...fourDirections(['attack', 4]), ['powerUp1', 6], ['powerUp1', 6], ['powerAttack', 6], ...fourDirections(['hit', 4]), ...fourDirections(['idle', 8]), ...fourDirections(['jump', 4]), ['death', 12], ['dieSoul', 12], ...fourDirections(['run', 4])],
	Minifantasy_CreaturesOrcBaseAnimations: [...fourDirections(['attack', 4]), ['powerUp1', 6], ['powerUp1', 6], ['powerAttack', 6], ...fourDirections(['hit', 4]), ...fourDirections(['idle', 8]), ...fourDirections(['jump', 4]), ['death', 12], ...fourDirections(['run', 4])],
}
