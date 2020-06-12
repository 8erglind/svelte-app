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
	<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 346 0 346 300 363 600 363 900 365 900 365 1200 365 1200"/>
</svg>




<img src="https://dimg.donga.com/egc/CDB/CHINESE/Article/20/07/06/07/2007060738918.jpg">






<div class="activedot activedot4"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>



</style>
