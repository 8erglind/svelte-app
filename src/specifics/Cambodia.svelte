<script>
	export let pagetitleText;
	export let rotate;
</script>





<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text"></div>
</div>

<div class="activedot activedot12">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>



</style>