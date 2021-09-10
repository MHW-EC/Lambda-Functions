class Combinador {
	constructor(clusters) {
		this.clusters = clusters;
		this.resultados = [];
		this.encontrarResultados();
	}

	permutations(arreglo) {
		let permutaciones = [];

		for (let i = 0; i < arreglo.length; i = i + 1) {
			let rest = this.permutations(
				arreglo.slice(0, i).concat(arreglo.slice(i + 1))
			);

			if (!rest.length) {
				permutaciones.push([arreglo[i]]);
			} else {
				for (let j = 0; j < rest.length; j = j + 1) {
					permutaciones.push([arreglo[i]].concat(rest[j]));
				}
			}
		}
		return permutaciones
	}
	cartesianProduct(a,b,...c){
		//Implementacion de producto cartesiano
		const concatCallBack = (a, b) => [].concat(...a.map((d) => b.map((e) => [].concat(d, e))));
		return (b ? Combinador.cartesianProduct(concatCallBack(a, b), ...c) : a);
	}

	cartesianProductV2(...a) {
		return a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
	}

	encontrarResultados() {
		//Obtengo las permutaciones de los grupos de materias
		let permutaciones = this.permutations(this.clusters);
		
		if(permutaciones.length === 1 ){ 
			//console.log(permutaciones)
			permutaciones = [ permutaciones ]
		} //parche 1 sola materia

		for (let idx = 0; idx < permutaciones.length; idx++) {
			const producotCartesiano = this.cartesianProduct(...permutaciones[idx]);
			for (let index = 0; index < producotCartesiano.length; index++) {
				const producto = producotCartesiano[index];
				this.resultados.push(producto);
			}
		}
	}

	get Resultados() {
		return this.resultados;
	}

	get Clusters() {
		return this.clusters;
	}

	setResultados(resultados) {
		this.resultados = resultados;
	}

	setClusters(clusters) {
		this.clusters = clusters;
	}
}
module.exports = Combinador;
