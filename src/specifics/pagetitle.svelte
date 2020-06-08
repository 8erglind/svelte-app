<script>
	export let pagetitleText;
	export let rotate;

	export let message = 'default text';
</script>



<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text">{message}</div>
</div>






<style>
	.pagetitle {
	    position: absolute;
	    /*top: 100px;
	    height: 80vh;
	    right: 20px;*/
	    font-size: 30px;
	    font-family: meadow;
	    z-index: 9;

	    pointer-events: none;

	    /*writing-mode: vertical-rl;
		text-orientation: mixed;*/


		bottom: 0vh;
		left: 0px;
		right: 0px;
		width: 100vw;
		text-align: center;

		/*background-color: yellow;*/

		bottom: 50vh;
	}
</style>