<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	import TimelinesEmpty from './TimelineEmpty.svelte';
</script>



<TimelinesEmpty></TimelinesEmpty>



<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text"></div>
</div>




<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
	<polygon class="cls-1" points="365 1200.5 365 900.5 365 600.5 365 300.5 365 0.5 263 0.5 263 300.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5"/>
</svg>

<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>



<div class="activedot activedot8"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>





<style>



</style>