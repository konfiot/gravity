function iaplay_bob (state, scores, played) {
	return [parseInt(Math.random() * state.length), parseInt(Math.random() * state.length)];
}
