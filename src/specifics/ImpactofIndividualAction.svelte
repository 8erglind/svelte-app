<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let firstSetup = true;	
	let secondSetup = false;
	let thirdSetup = false;
	let fourthSetup = false;
	let fifthSetup = false;

	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		thirdSetup = false;
	}
	const togglethirdSetup = () => {
		secondSetup = false;
		thirdSetup = true;
		fourthSetup = false;
	}
	const togglefourthSetup = () => {
		thirdSetup = false;
		fourthSetup = true;
		fifthSetup = false;
	}
	const togglefifthSetup = () => {
		fourthSetup = false;
		fifthSetup = true;
	}
</script>





<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetup}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdSetup}
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}





<!--    TEXT    -->

<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The argument that climate action in the West is not impactfull on it's own is simply wrong. Speaking of individual action specifically, the impact of climate action in India is ranked as Medium, while the impact of individual action in most north-western countries are ranked as High or&nbsp;Highest.
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Countries that are ranked as having Medium impact on an individual level are:<br>
		<span class="text">Albania, Angola, Argentina, Armenia, Azerbaijan, Bhutan, Bolivia, Botswana, <i>Brazil</i>, Chile, Columbia, Costa&nbsp;Rica, Croatia, Cuba, Dominican Republic, Ecuador, Egypt, El&nbsp;Salvador, Fiji, Gabon, Georgia, Guatemala, Guyana, Honduras, <i>India</i>, Indonesia, Jamaica, Jordan, Kyrgyz Republic, Lebanon, Lesotho, Mexico, Montenegro, North&nbsp;Korea, Namibia, North&nbsp;Macedonia, Pakistan, Panama, Peru, Philippines, Suriname, Sweden, Switzerland, Syria, Tailand, Tunisia, Uruguay, Uzbekistan, Venezuela,&nbsp;Vietnam.</span>
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Countries that are ranked as having Low impact on an individual level are:<br>
		<span class="text">Afghanistan, Bangladesh, Benin, Burkina Faso, Burundi, <i>Cambodia</i>, Cameroon, Central African Republic, Chad, Congo, Cote&nbsp;d-Ivoire, Democratic Republic of Congo, Eritrea, Ethiopia, <i>Ghana</i>, Guinea, Haiti, Kenya, Lao, Liberia, Madagascar, Malawi, Mali, Mauritania, Mozambique, Myanmar, Nepal, Nicaragua, Niger, Nigeria, Papua New Guinea, Paraguay, Rwanda, Senegal, Sierra&nbsp;Leone, Solomon&nbsp;Islands, Somalia, South Sudan, Tajiksistan, Tanzania, Timor-Leste, Togo, Uganda, Vanuata, Yemen, Zambia,&nbsp;Zimbabwe.</span>
	</div>	

	<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 0);">All climate action counts, but not equally.</div>
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Countries that are ranked as having High impact on an individual level are:<br>
		<span class="text">Algeria, Austria, Belarus, Belgium, Bosnia and Herzegovina, Bulgaria, China, Denmark, Equatorial Guinea, Finland, France, Greece, Hungary, Iran, Iraq, Ireland, Israel, Italy, Lybia, Malaysia, Morocco, New Zealand, Norway, Poland, Portugal, Serbia, Slovakia, Slovenia, South&nbsp;Africa, Spain, Turkey,&nbsp;the&nbsp;U.K.</span>
	</div>	

	<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 0);">If you live in one of these countries your personal climate action (or lack there of) counts,<br>greatly.</div>
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Countries that are ranked as having Highest impact on an individual level are:<br>
		<span class="text">Australia, Canada, Czech, Estonia, Germany, <i>Iceland</i>, Japan, Kazakhstan, Mongolia, Oman, Qatar, Russia, <i>Saudi Arabia</i>, <i>South&nbsp;Korea</i>, <i>The&nbsp;Netherlands</i>, Trinidad and Tobago, Turkmenistan, <i>The&nbsp;U.S.</i>, United Arab&nbsp;Emirates.</span>
	</div>	

	<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 0);">If you live in one of these countries your personal climate action (or lack there of) counts,<br>very&nbsp;greatly!</div>
{/if}








<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>

<!-- FOOTER -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			Source <a target="_blank" href="https://feu-us.org/impact-of-individual-action/">[1]</a>.
		</div>
</div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text {color: rgb(70,70,70);}
	.text a {color: rgb(70,70,70);}
	.criticalText {color: blue;}

</style>