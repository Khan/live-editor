$(function() {
	getExerciseList(function( exercises ) {
		var ul = $("#exercises");
	
		ul.html( exercises.length ? "" : "<li>No exercises found.</li>" );
	
		$.each( exercises, function() {
			var exercise = this;

			// TODO: Maybe show who created the exercise
			$("<li><a href='cs/exercise?" + exercise.id + "'>" + exercise.title + "</a></li>")
				.appendTo( ul );
		});
	});
	
});