<script>
	export let pagetitleText;
	export let rotate;

	import TimelinesEmpty from './TimelineEmpty.svelte';
</script>



<TimelinesEmpty></TimelinesEmpty>

<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text"></div>
</div>




<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
	<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200"/>
</svg>










<div class="activedot activedot6"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>







<style>



</style>