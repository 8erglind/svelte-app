<script></script>


<div class="tempMeter"></div>




<style>
	.tempMeter {
		position: absolute;
		top: calc((100vw / 16) - 8px);   /* added the -8px just to push it up a bit  */
		left: calc(100vw / 16);
		right: calc(100vw / 16);
		height: calc(((95vh - 1px) / 9) - ((100vw / 16) * 2) - 2px);
		border: 1px solid black;
	}
</style>