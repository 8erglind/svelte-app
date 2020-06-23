<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
</script>





<!--<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>-->
<div class="pagetitle" style="transform: rotate({rotate});">... is the<br>policy of<br>The<br>Critical<br>Decade:<br>III</div>


<div class="activedot activedot16"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
	<!--<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>-->
</div>


<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>
<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">Sign pledge</div>



<style>



</style>